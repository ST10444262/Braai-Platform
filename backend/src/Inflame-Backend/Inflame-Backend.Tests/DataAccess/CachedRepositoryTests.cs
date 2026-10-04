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
    /// Uses a <see cref="FakeRedisInstance"/> to inject a mock IDatabase without a real Redis
    /// connection, then verifies:
    ///   1. Cache Hit  – inner repository is NEVER called when Redis has data.
    ///   2. Cache Miss – inner repository IS called and result is saved to Redis.
    ///   3. Cache Invalidation – write operations delete the relevant Redis cache keys.
    /// </summary>
    public class CachedRepositoryTests
    {
        //----------------------------------------------------------------------------------------------//
        #region Test Infrastructure

        /// <summary>
        /// A fake RedisInstance that returns a mocked IDatabase instead of connecting to
        /// a real Redis server. The <see cref="Lazy{T}"/> is never evaluated.
        /// </summary>
        private class FakeRedisInstance : RedisInstance
        {
            private readonly IDatabase _db;

            /// <summary>
            /// Passes a dummy (non-connecting) URI to the base constructor so the Lazy is
            /// set up but never evaluated. The connection is never established because
            /// neither <see cref="Connection"/> nor <see cref="GetDatabase"/> on the base
            /// class are used – we override GetDatabase below.
            /// </summary>
            public FakeRedisInstance(IDatabase db)
                // Use a throwaway string; the Lazy is never evaluated in tests.
                : base("redis://localhost:9999")
            {
                _db = db;
            }

            /// <summary>New (hiding) method returns the mock IDatabase directly.</summary>
            public new IDatabase GetDatabase() => _db;
        }

        /// <summary>
        /// Concrete test-double that calls the FakeRedisInstance overload of GetDatabase()
        /// during base construction, so CachedBaseRepository._redisDatabase = our mock.
        /// </summary>
        private class FakeCachedProductRepository : CachedBaseRepository<Product>, IProductRepository
        {
            public FakeCachedProductRepository(IProductRepository inner, FakeRedisInstance fakeRedis)
                : base(inner, fakeRedis)
            {
                // CachedBaseRepository ctor calls redisInstance.GetDatabase(), but because
                // we are passing a FakeRedisInstance and CachedBaseRepository stores whatever
                // GetDatabase() returns via the reference, we post-correct _redisDatabase by
                // reflection so it points to the mock instead of the base GetDatabase().
                //
                // Note: fakeRedis.GetDatabase() returns _db (the mock), but RedisInstance.GetDatabase()
                // on the base class would try to evaluate the Lazy.  We fix this via reflection.
                var field = typeof(CachedBaseRepository<Product>)
                    .GetField("_redisDatabase",
                        System.Reflection.BindingFlags.NonPublic |
                        System.Reflection.BindingFlags.Instance);
                field!.SetValue(this, fakeRedis.GetDatabase());
            }
        }

        /// <summary>
        /// Helper that creates a <see cref="FakeCachedProductRepository"/> together with
        /// the mocked inner repo and mocked Redis IDatabase.
        /// </summary>
        private static (FakeCachedProductRepository cachedRepo,
                         Mock<IProductRepository> mockInner,
                         Mock<IDatabase> mockRedis)
            BuildCachedRepo()
        {
            var mockInner = new Mock<IProductRepository>();
            var mockRedis = new Mock<IDatabase>();
            var fakeRedis = new FakeRedisInstance(mockRedis.Object);

            // We must prevent the base ctor from calling the real GetDatabase().
            // We pass null for RedisInstance so GetDatabase() is never called during base
            // construction, then inject via reflection afterwards.
            var cachedRepo = new FakeCachedProductRepository(mockInner.Object, fakeRedis);
            return (cachedRepo, mockInner, mockRedis);
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
                new Product { ProductId = Guid.NewGuid(), Name = "Cached Braai",     Price = 1000m },
                new Product { ProductId = Guid.NewGuid(), Name = "Cached Fireplace", Price = 5000m }
            };
            var cachedJson = JsonSerializer.Serialize(cachedProducts);

            // Redis returns valid JSON (cache hit)
            mockRedis
                .Setup(r => r.StringGetAsync("product:all", CommandFlags.None))
                .ReturnsAsync((RedisValue)cachedJson);

            // Act
            var result = await cachedRepo.GetAllAsync();

            // Assert
            result.Should().HaveCount(2);
            result[0].Name.Should().Be("Cached Braai");

            // Critical: inner Postgres repo must NEVER be called on a cache hit
            mockInner.Verify(
                r => r.GetAllAsync(),
                Times.Never,
                "A cache hit must prevent any round-trip to the underlying database");
        }

        [Fact]
        public async Task GetByIdAsync_WhenCacheHit_ShouldReturnCachedEntityWithoutCallingInnerRepo()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var productId = Guid.NewGuid();
            var cachedProduct = new Product { ProductId = productId, Name = "Cached Product", Price = 2000m };

            mockRedis
                .Setup(r => r.StringGetAsync($"product:{productId}", CommandFlags.None))
                .ReturnsAsync((RedisValue)JsonSerializer.Serialize(cachedProduct));

            // Act
            var result = await cachedRepo.GetByIdAsync(productId);

            // Assert
            result.Should().NotBeNull();
            result!.ProductId.Should().Be(productId);

            mockInner.Verify(
                r => r.GetByIdAsync(It.IsAny<Guid>()),
                Times.Never,
                "A cache hit for GetById must never invoke the inner repository");
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
                new Product { ProductId = Guid.NewGuid(), Name = "DB Braai",     Price = 3000m },
                new Product { ProductId = Guid.NewGuid(), Name = "DB Fireplace", Price = 9000m }
            };

            // Cache miss: Redis returns null
            mockRedis
                .Setup(r => r.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(RedisValue.Null);

            mockInner.Setup(r => r.GetAllAsync()).ReturnsAsync(freshProducts);

            // Act
            var result = await cachedRepo.GetAllAsync();

            // Assert – inner repo called once
            mockInner.Verify(
                r => r.GetAllAsync(),
                Times.Once,
                "A cache miss must fall back to the inner PostgreSQL repository");

            result.Should().HaveCount(2);

            // Verify Redis was asked to store the result by checking Invocations directly.
            // This avoids Moq overload resolution issues with different StackExchange.Redis versions.
            var stringSetInvocations = System.Linq.Enumerable.Where(mockRedis.Invocations, 
                i => i.Method.Name == "StringSetAsync");
            
            stringSetInvocations.Should().NotBeEmpty(
                "After a cache miss the fresh data must be stored in Redis to prevent future misses");
        }

        [Fact]
        public async Task GetByIdAsync_WhenCacheMiss_ShouldCallInnerRepoAndStoreResultInRedis()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();

            var productId = Guid.NewGuid();
            var freshProduct = new Product { ProductId = productId, Name = "DB Product", Price = 4000m };

            mockRedis
                .Setup(r => r.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(RedisValue.Null);

            mockInner.Setup(r => r.GetByIdAsync(productId)).ReturnsAsync(freshProduct);

            // Act
            var result = await cachedRepo.GetByIdAsync(productId);

            // Assert
            mockInner.Verify(r => r.GetByIdAsync(productId), Times.Once);
            result.Should().NotBeNull();

            var stringSetInvocations = System.Linq.Enumerable.Where(mockRedis.Invocations, 
                i => i.Method.Name == "StringSetAsync");
            
            stringSetInvocations.Should().NotBeEmpty(
                "The retrieved entity must be stored in Redis after a cache miss");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Test 3 – Cache Invalidation: write operations must delete stale Redis keys

        [Fact]
        public async Task UpdateAsync_ShouldCallInnerRepoAndInvalidateCacheKey()
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

            // Assert
            mockInner.Verify(r => r.UpdateAsync(product), Times.Once);
            mockRedis.Verify(
                r => r.KeyDeleteAsync("product:all", CommandFlags.None),
                Times.Once,
                "Updating a product must invalidate the 'all products' cache key in Redis");
        }

        [Fact]
        public async Task AddAsync_ShouldCallInnerRepoAndInvalidateCacheKey()
        {
            // Arrange
            var (cachedRepo, mockInner, mockRedis) = BuildCachedRepo();
            var product = new Product { ProductId = Guid.NewGuid(), Name = "New Product", Price = 2500m };

            mockInner.Setup(r => r.AddAsync(product)).ReturnsAsync(product);
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
                "Adding a product must invalidate the 'all products' cache key so new data is visible");
        }

        [Fact]
        public async Task DeleteAsync_ShouldCallInnerRepoAndInvalidateCacheKey()
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
                "Deleting a product must invalidate the 'all products' cache key");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
