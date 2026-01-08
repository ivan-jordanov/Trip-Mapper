using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using TripMapperBL.DTOs;
using TripMapperBL.Helpers;
using TripMapperBL.Interfaces;
using TripMapperBL.Services;

public class PhotoUploadService
{
    private readonly IAmazonS3 _s3;
    private readonly BackblazeSettings _settings;
    private readonly IPhotoService _photoService;

    public PhotoUploadService(IOptions<BackblazeSettings> options, IPhotoService photoService)
    {
        _settings = options.Value;
        _photoService = photoService;

        var cfg = new AmazonS3Config
        {
            ServiceURL = _settings.Endpoint, 
            ForcePathStyle = true
        };
        _s3 = new AmazonS3Client(_settings.KeyId, _settings.ApplicationKey, cfg);
    }

    public async Task<PhotoDto> UploadForPinAsync(int pinId, IFormFile file, int currentUserId)
    {
        var (key, url) = await UploadToBackblazeAsync(file);
        // Persist to DB via BL:
        return await _photoService.CreatePhotoRecordForPinAsync(pinId, url, currentUserId);
    }

    public async Task<PhotoDto> UploadForTripAsync(int tripId, IFormFile file, int currentUserId)
    {
        var (key, url) = await UploadToBackblazeAsync(file);
        return await _photoService.CreatePhotoRecordForTripAsync(tripId, url, currentUserId);
    }

    public async Task<bool> DeleteAsync(int photoId, string url, int currentUserId)
    {
        // Delete from storage FIRST
        var key = ExtractKeyFromUrl(url);
        if (!string.IsNullOrWhiteSpace(key))
        {
            try
            {
                var del = await _s3.DeleteObjectAsync(new DeleteObjectRequest
                {
                    BucketName = _settings.BucketName,
                    Key = key
                });

                // Check if deletion was successful (200/204)
                var storageDeleted = del.HttpStatusCode == System.Net.HttpStatusCode.OK ||
                                   del.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
                
                if (!storageDeleted)
                {
                    throw new Exception("Failed to delete photo from storage.");
                }
            }
            catch
            {
                throw new Exception("Error occurred while deleting photo from storage.");
            }
        }

        // Delete DB record after storage deletion
        var ok = await _photoService.DeletePhotoRecordAsync(photoId, currentUserId);
        return ok;
    }

    private async Task<(string key, string url)> UploadToBackblazeAsync(IFormFile file)
    {
        var safeName = Path.GetFileName(file.FileName);
        var key = $"{Guid.NewGuid():N}_{safeName}";

        using var stream = file.OpenReadStream();

        var putReq = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType
        };

        await _s3.PutObjectAsync(putReq);

        // public URL format (for public bucket). For private: generate pre-signed URL instead.
        var url = $"{_settings.Endpoint}/{_settings.BucketName}/{key}";
        return (key, url);
    }

    private string ExtractKeyFromUrl(string url)
    {
        // https://s3.eu-central-003.backblazeb2.com/bucket/key
        try
        {
            var uri = new Uri(url);
            var path = uri.AbsolutePath.TrimStart('/');
            var slash = path.IndexOf('/');
            if (slash < 0) return string.Empty;
            return path[(slash + 1)..];
        }
        catch
        {
            return string.Empty;
        }
    }
}