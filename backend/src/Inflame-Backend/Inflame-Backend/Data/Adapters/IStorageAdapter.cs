using System.Threading.Tasks;

namespace Inflame_Backend.Data.Adapters
{
    /// <summary>
    /// Adapter interface for interacting with cloud storage services.
    /// </summary>
    public interface IStorageAdapter
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Uploads a file to the storage provider.
        /// </summary>
        Task<string> UploadFileAsync(string bucketName, string fileName, byte[] fileData);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves the public URL of a stored file.
        /// </summary>
        string GetFileUrl(string bucketName, string fileName);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes a file from the storage provider.
        /// </summary>
        Task DeleteFileAsync(string bucketName, string fileName);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//