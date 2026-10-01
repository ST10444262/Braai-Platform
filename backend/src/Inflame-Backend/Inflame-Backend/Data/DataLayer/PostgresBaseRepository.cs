using Inflame_Backend.Data.Instances;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.DataLayer
{
    /// <summary>
    /// Primary generic database repository interacting directly with Supabase PostgreSQL.
    /// </summary>
    /// <typeparam name="T">The model type, which must inherit from BaseModel</typeparam>
    public class PostgresBaseRepository<T> : IBaseRepository<T> where T : BaseModel, new()
    {
        #region Configuration
        protected readonly SupabaseInstance _supabaseInstance;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Inject the SupabaseInstance to enable direct database operations.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresBaseRepository(SupabaseInstance supabaseInstance)
        {
            _supabaseInstance = supabaseInstance;
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch all entities of type T from the PostgreSQL database.
        /// </summary>
        /// <returns></returns>
        public async Task<List<T>> GetAllAsync()
        {
            var response = await _supabaseInstance.Client.From<T>().Get();
            return response.Models;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch an entity of type T by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<T?> GetByIdAsync(Guid id)
        {
            var property = typeof(T).GetProperties()
                .FirstOrDefault(p => p.GetCustomAttribute<PrimaryKeyAttribute>() != null);

            if (property == null)
            {
                throw new InvalidOperationException($"No PrimaryKey attribute found on type {typeof(T).Name}");
            }

            var columnName = property.GetCustomAttribute<PrimaryKeyAttribute>()?.ColumnName ?? property.Name;
            var response = await _supabaseInstance.Client
                .From<T>()
                .Filter(columnName, Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
                .Single();

            return response;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Add a new entity of type T to the PostgreSQL database.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task AddAsync(T entity)
        {
            await _supabaseInstance.Client.From<T>().Insert(entity);
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Update an existing entity of type T in the PostgreSQL database.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task UpdateAsync(T entity)
        {
            await _supabaseInstance.Client.From<T>().Update(entity);
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Delete an entity of type T from the PostgreSQL database.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task DeleteAsync(T entity)
        {
            await _supabaseInstance.Client.From<T>().Delete(entity);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//