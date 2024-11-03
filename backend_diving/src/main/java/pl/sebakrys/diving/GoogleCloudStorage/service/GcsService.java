package pl.sebakrys.diving.GoogleCloudStorage.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.Storage.SignUrlOption;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GcsService {

    private static final Logger logger = LoggerFactory.getLogger(GcsService.class);

    private final Storage storage;
    private final String bucketName;

    public GcsService(@Value("${spring.cloud.gcp.storage.bucket}") String bucketName,
                      @Value("${spring.cloud.gcp.credentials.location}") String credentialsLocation) {
        this.bucketName = bucketName;

        // Ładowanie poświadczeń serwisowych
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("truedivers-9135e5a895dd.json")) {
            if (is == null) {
                logger.error("Service account credentials file 'truedivers-9135e5a895dd.json' not found in classpath!");
                throw new RuntimeException("Service account credentials file not found.");
            } else {
                ServiceAccountCredentials credentials = ServiceAccountCredentials.fromStream(is);
                this.storage = StorageOptions.newBuilder()
                        .setProjectId(credentials.getProjectId())
                        .setCredentials(credentials)
                        .build()
                        .getService();
                logger.debug("Service account credentials loaded successfully for project: {}", credentials.getProjectId());
            }
        } catch (IOException e) {
            logger.error("Error loading service account credentials: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to load service account credentials.", e);
        }
    }

    /**
     * Przesyła plik do Google Cloud Storage.
     *
     * @param file MultipartFile do przesłania.
     * @return Standardowy URL do przesłanego pliku w GCS.
     * @throws IOException Jeśli wystąpi błąd podczas odczytu pliku.
     */
    public String uploadFile(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        try {
            storage.create(blobInfo, file.getBytes());
            String fileUrl = "https://storage.googleapis.com/" + bucketName + "/" + filename;
            logger.debug("Uploaded file to GCS: {}", fileUrl);
            return fileUrl;
        } catch (Exception e) {
            logger.error("Error uploading file to GCS: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Generuje podpisany URL dla pobrania pliku w GCS.
     *
     * @param filename Nazwa pliku w GCS.
     * @param duration Czas trwania URL.
     * @param unit     Jednostka czasu (np. SECONDS, MINUTES).
     * @return Podpisany URL do pobrania pliku.
     */
    public URL generateSignedUrlForDownload(String filename, long duration, TimeUnit unit) {
        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
        try {
            URL signedUrl = storage.signUrl(blobInfo, duration, unit, SignUrlOption.withV4Signature());
            logger.debug("Generated signed download URL: {}", signedUrl);
            return signedUrl;
        } catch (Exception e) {
            logger.error("Error generating signed download URL for {}: {}", filename, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Generuje podpisany URL dla przesłania pliku do GCS.
     *
     * @param filename Nazwa pliku w GCS.
     * @param duration Czas trwania URL.
     * @param unit     Jednostka czasu (np. SECONDS, MINUTES).
     * @return Podpisany URL do przesłania pliku.
     */
    public URL generateSignedUrlForUpload(String filename, long duration, TimeUnit unit) {
        BlobId blobId = BlobId.of(bucketName, filename);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
        try {
            URL signedUrl = storage.signUrl(blobInfo, duration, unit,
                    SignUrlOption.httpMethod(com.google.cloud.storage.HttpMethod.PUT),
                    SignUrlOption.withV4Signature());
            logger.debug("Generated signed upload URL: {}", signedUrl);
            return signedUrl;
        } catch (Exception e) {
            logger.error("Error generating signed upload URL for {}: {}", filename, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Lista obiektów w bucketcie.
     *
     * @return Lista nazw obiektów.
     */
    public List<String> listBucketObjects() {
        List<String> objectNames = new ArrayList<>();
        try {
            storage.list(bucketName).iterateAll().forEach(blob -> objectNames.add(blob.getName()));
            logger.debug("Listed {} objects in bucket {}", objectNames.size(), bucketName);
        } catch (Exception e) {
            logger.error("Error listing objects in bucket {}: {}", bucketName, e.getMessage(), e);
            throw e;
        }
        return objectNames;
    }

    /**
     * Usuwa plik z Google Cloud Storage.
     *
     * @param filename Nazwa pliku do usunięcia.
     * @return true jeśli plik został usunięty, false w przeciwnym razie.
     */
    public boolean deleteFile(String filename) {
        BlobId blobId = BlobId.of(bucketName, filename);
        try {
            boolean deleted = storage.delete(blobId);
            if (deleted) {
                logger.debug("Deleted file from GCS: {}", filename);
            } else {
                logger.warn("File not found in GCS: {}", filename);
            }
            return deleted;
        } catch (Exception e) {
            logger.error("Error deleting file from GCS: {}", e.getMessage(), e);
            return false;
        }
    }
}
