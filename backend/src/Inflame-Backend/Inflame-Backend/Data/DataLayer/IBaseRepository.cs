using Supabase.Postgrest.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.DataLayer
{
    /// <summary>
    /// Generic abstraction layer for repository operations.
    /// Provides common CRUD functionality for all Supabase models.
    /// </summary>
    /// <typeparam name="T">The model type, which must inherit from BaseModel</typeparam>
    public interface IBaseRepository<T> where T : BaseModel, new()
    {
        Task<List<T>> GetAllAsync();
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//