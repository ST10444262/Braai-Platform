using Inflame_Backend.Data.Instances;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Adapters
{
    /// <summary>
    /// Supabase implementation of the IStorageAdapter.
    /// </summary>
    public class SupabaseStorageAdapter : IStorageAdapter
    {
        #region Configuration
        private readonly SupabaseInstance _supabaseInstance;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the SupabaseStorageAdapter.
        /// </summary>
        /// <param name="supabaseInstance">The singleton Supabase instance.</param>
        public SupabaseStorageAdapter(SupabaseInstance supabaseInstance)
        {
            _supabaseInstance = supabaseInstance;
        }
        #endregion

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Uploads a file to the Supabase storage bucket.
        /// </summary>
        public async Task<string> UploadFileAsync(string bucketName, string fileName, byte[] fileData)
        {
            try
            {
                var response = await _supabaseInstance.Client.Storage.From(bucketName).Upload(fileData, fileName, new Supabase.Storage.FileOptions { Upsert = true });
                return response;
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Bucket not found", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        await _supabaseInstance.Client.Storage.CreateBucket(bucketName, new Supabase.Storage.BucketUpsertOptions { Public = true });
                        var response = await _supabaseInstance.Client.Storage.From(bucketName).Upload(fileData, fileName, new Supabase.Storage.FileOptions { Upsert = true });
                        return response;
                    }
                    catch (Exception innerEx)
                    {
                        throw new Exception($"Failed to create bucket and upload file: {innerEx.Message}");
                    }
                }
                throw new Exception($"Failed to upload file to Supabase storage: {ex.Message}");
            }
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves the public URL of a stored file in Supabase.
        /// </summary>
        public string GetFileUrl(string bucketName, string fileName)
        {
            var url = _supabaseInstance.Client.Storage.From(bucketName).GetPublicUrl(fileName);
            return url;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes a file from the Supabase storage bucket.
        /// </summary>
        public async Task DeleteFileAsync(string bucketName, string fileName)
        {
            try
            {
                await _supabaseInstance.Client.Storage.From(bucketName).Remove(new List<string> { fileName });
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to delete file from Supabase storage: {ex.Message}");
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//