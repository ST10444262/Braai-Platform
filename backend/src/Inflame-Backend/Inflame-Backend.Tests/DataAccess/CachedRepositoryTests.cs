using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Models.ProductCatalog;
using Moq;
using StackExchange.Redis;
using Xunit;

namespace Inflame_Backend.Tests.DataAccess
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the CachedBaseRepository / CachedProductRepository (Decorator Pattern).
    /// Mocks both the Redis IDatabase and the inner PostgreSQL repository to verify:
    ///   1. Cache Hit  – inner repository is NEVER called when Redis has data.
    ///   2. Cache Miss – inner repository IS called and result is saved to Redis.
    ///   3. Cache Invalidation – write operations delete the relevant Redis cache keys.
    /// </summary>
    public class CachedRepositoryTests
    {
        //----------------------------------------------------------------------------------------------//
        #region Test Helpers

        /// <summary>
        /// Builds a CachedProductRepository whose Redis IDatabase and inner IProductRepository
        /// are both mocked, returning the fixture for full setup flexibility.
        /// </summary>
        private static (CachedProductRepository cachedRepo,
                         Mock<IProductRepository> mockInner,
                         Mock<IDatabase> mockRedis)
            BuildCachedRepo()
        {
            var mockInner = new Mock<IProductRepository>();
            var mockRedis = new Mock<IDatabase>();

            // Build a RedisInstance whose GetDatabase() returns the mock IDatabase.
            // We inject using a test-friendly subclass that accepts an IDatabase directly.
            var testRedisInstance = new TestRedisInstance(mockRedis.Object);

            var cachedRepo = new CachedProductRepository(mockInner.Object, testRedisInstance);
            return (cachedRepo, mockInner, mockRedis);
        }

        /// <summary>
        /// A RedisInstance subclass that skips the real connection and returns a mock IDatabase.
        /// </summary>
        private class TestRedisInstance : RedisInstance
        {
            private readonly IDatabase _db;

            public TestRedisInstance(IDatabase db)
                : base("redis://localhost:6379") // dummy string – connection never made
            {
                _db = db;
            }

            public new IDatabase GetDatabase() => _db;
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 1 – Cache Hit: inner repository must NOT be called

        [Fact]
        public async Task GetAllAsync_WhenCacheHit_ShouldReturnCachedDataWithoutCallingInnerRepo()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var cachedProducts = new List<Product>
            {
                new Product { ProductId = Guid.NewGuid(), Name = "Cached Braai",   Price = 1000m },
                new Product { ProductId = Guid.NewGuid(), Name = "Cached Fireplace", Price = 5000m }
            };
            var cachedJson = JsonSerializer.Serialize(cachedProducts);

            // Redis returns a valid JSON string (cache hit)
            mockRedis
                .Setup(r => r.StringGetAsync("product:all", CommandFlags.None))
                .ReturnsAsync((RedisValue)cachedJson);

            // Act
            var result = await cachedRepo.GetAllAsync();

            // Assert – results come from cache
            result.Should().HaveCount(2);
            result[0].Name.Should().Be("Cached Braai");

            // Critical: inner Postgres repo must NEVER have been called
            mockInner.Verify(r => r.GetAllAsync(), Times.Never,
                because: "a cache hit must prevent any round-trip to the underlying database");
        }

        [Fact]
        public async Task GetByIdAsync_WhenCacheHit_ShouldReturnCachedEntityWithoutCallingInnerRepo()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var productId = Guid.NewGuid();
            var cachedProduct = new Product { ProductId = productId, Name = "Cached Product", Price = 2000m };
            var cachedJson = JsonSerializer.Serialize(cachedProduct);

            mockRedis
                .Setup(r => r.StringGetAsync($"product:{productId}", CommandFlags.None))
                .ReturnsAsync((RedisValue)cachedJson);

            // Act
            var result = await cachedRepo.GetByIdAsync(productId);

            // Assert
            result.Should().NotBeNull();
            result!.ProductId.Should().Be(productId);

            mockInner.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never,
                because: "a cache hit for GetById must never invoke the inner repository");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 2 – Cache Miss: inner repository IS called and result stored in Redis

        [Fact]
        public async Task GetAllAsync_WhenCacheMiss_ShouldCallInnerRepoAndStoreResultInRedis()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var freshProducts = new List<Product>
            {
                new Product { ProductId = Guid.NewGuid(), Name = "DB Braai",   Price = 3000m },
                new Product { ProductId = Guid.NewGuid(), Name = "DB Fireplace", Price = 9000m }
            };

            // Redis returns empty/null (cache miss)
            mockRedis
                .Setup(r => r.StringGetAsync("product:all", CommandFlags.None))
                .ReturnsAsync(RedisValue.Null);

            // Inner repo returns fresh data
            mockInner.Setup(r => r.GetAllAsync()).ReturnsAsync(freshProducts);

            // Redis.StringSetAsync must be callable
            mockRedis
                .Setup(r => r.StringSetAsync(
                    It.IsAny<RedisKey>(),
                    It.IsAny<RedisValue>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<bool>(),
                    It.IsAny<When>(),
                    It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await cachedRepo.GetAllAsync();

            // Assert – inner repo called
            mockInner.Verify(r => r.GetAllAsync(), Times.Once,
                because: "a cache miss must fall back to the inner PostgreSQL repository");

            result.Should().HaveCount(2);

            // Redis.StringSetAsync was called to store the result for next time
            mockRedis.Verify(
                r => r.StringSetAsync(
                    "product:all",
                    It.IsAny<RedisValue>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<bool>(),
                    It.IsAny<When>(),
                    It.IsAny<CommandFlags>()),
                Times.Once,
                because: "after a cache miss the fresh data must be stored in Redis to prevent future misses");
        }

        [Fact]
        public async Task GetByIdAsync_WhenCacheMiss_ShouldCallInnerRepoAndStoreResultInRedis()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var productId = Guid.NewGuid();
            var freshProduct = new Product { ProductId = productId, Name = "DB Product", Price = 4000m };

            mockRedis
                .Setup(r => r.StringGetAsync($"product:{productId}", CommandFlags.None))
                .ReturnsAsync(RedisValue.Null);

            mockInner.Setup(r => r.GetByIdAsync(productId)).ReturnsAsync(freshProduct);

            mockRedis
                .Setup(r => r.StringSetAsync(
                    It.IsAny<RedisKey>(),
                    It.IsAny<RedisValue>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<bool>(),
                    It.IsAny<When>(),
                    It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            var result = await cachedRepo.GetByIdAsync(productId);

            // Assert
            mockInner.Verify(r => r.GetByIdAsync(productId), Times.Once);
            result.Should().NotBeNull();

            mockRedis.Verify(
                r => r.StringSetAsync(
                    $"product:{productId}",
                    It.IsAny<RedisValue>(),
                    It.IsAny<TimeSpan?>(),
                    It.IsAny<bool>(),
                    It.IsAny<When>(),
                    It.IsAny<CommandFlags>()),
                Times.Once,
                because: "the retrieved entity must be stored in Redis after a cache miss");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 3 – Cache Invalidation: write operations delete the stale Redis keys

        [Fact]
        public async Task UpdateAsync_ShouldInvalidateCacheKeyAfterWriting()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var product = new Product { ProductId = Guid.NewGuid(), Name = "Updated Product", Price = 5500m };

            mockInner.Setup(r => r.UpdateAsync(product)).Returns(Task.CompletedTask);
            mockRedis
                .Setup(r => r.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await cachedRepo.UpdateAsync(product);

            // Assert – inner repo was called
            mockInner.Verify(r => r.UpdateAsync(product), Times.Once);

            // Cache key for "all" products must be deleted to prevent stale reads
            mockRedis.Verify(
                r => r.KeyDeleteAsync("product:all", CommandFlags.None),
                Times.Once,
                because: "updating a product must invalidate the 'all products' cache key in Redis");
        }

        [Fact]
        public async Task AddAsync_ShouldInvalidateCacheKeyAfterWriting()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var product = new Product { ProductId = Guid.NewGuid(), Name = "New Product", Price = 2500m };

            mockInner.Setup(r => r.AddAsync(product)).Returns(Task.CompletedTask);
            mockRedis
                .Setup(r => r.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await cachedRepo.AddAsync(product);

            // Assert
            mockInner.Verify(r => r.AddAsync(product), Times.Once);

            mockRedis.Verify(
                r => r.KeyDeleteAsync("product:all", CommandFlags.None),
                Times.Once,
                because: "adding a product must invalidate the 'all products' cache key so new data is visible");
        }

        [Fact]
        public async Task DeleteAsync_ShouldInvalidateCacheKeyAfterDeletion()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var product = new Product { ProductId = Guid.NewGuid(), Name = "To Delete", Price = 1500m };

            mockInner.Setup(r => r.DeleteAsync(product)).Returns(Task.CompletedTask);
            mockRedis
                .Setup(r => r.KeyDeleteAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            // Act
            await cachedRepo.DeleteAsync(product);

            // Assert
            mockInner.Verify(r => r.DeleteAsync(product), Times.Once);

            mockRedis.Verify(
                r => r.KeyDeleteAsync("product:all", CommandFlags.None),
                Times.Once,
                because: "deleting a product must invalidate the 'all products' cache key");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
