
import jakarta.enterprise.inject.se.SeContainer;
import jakarta.enterprise.inject.se.SeContainerInitializer;
import jakarta.ws.rs.core.Response;
import io.smallrye.mutiny.Uni;
import org.example.s3.FileObject;
import org.example.s3.FormData;
import org.example.s3.S3AsyncClientResource;
import org.example.s3.S3SyncClientResource;
import org.jboss.resteasy.reactive.RestMulti;
import io.vertx.core.buffer.Buffer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.List;

public class S3ClientMain {

    private static final Logger logger = LoggerFactory.getLogger(S3ClientMain.class);

    public static void main(String[] args) {
        SeContainerInitializer initializer = SeContainerInitializer.newInstance();
        try (SeContainer container = initializer.initialize()) {

            S3SyncClientResource syncResource = container.select(S3SyncClientResource.class).get();
            S3AsyncClientResource asyncResource = container.select(S3AsyncClientResource.class).get();

            // Upload file using sync client
            FormData formData = new FormData();
            formData.data = new File("path_to_file");
            formData.filename = "your-file-name";
            formData.mimetype = "application/octet-stream";

            Response syncUploadResponse = syncResource.uploadFile(formData);
            logger.info("Sync Upload Response: {}", syncUploadResponse.getStatus());

            // Download file using sync client
            Response syncDownloadResponse = syncResource.downloadFile("your-file-name");
            logger.info("Sync Download Response: {}", syncDownloadResponse.getStatus());

            // List files using sync client
            List<FileObject> syncFileList = syncResource.listFiles();
            logger.info("Sync List Files: {}", syncFileList);

            // Delete file using sync client
            Response syncDeleteResponse = syncResource.deleteFile("your-file-name");
            logger.info("Sync Delete Response: {}", syncDeleteResponse.getStatus());

            // Upload file using async client
            Uni<Response> asyncUploadResponse = asyncResource.uploadFile(formData);
            asyncUploadResponse.subscribe().with(
                    response -> logger.info("Async Upload Response: {}", response.getStatus()),
                    failure -> logger.error("Async Upload Failure: {}", failure.getMessage())
            );

            // Download file using async client
            RestMulti<Buffer> asyncDownloadResponse = asyncResource.downloadFile("your-file-name");
            asyncDownloadResponse.subscribe().with(
                    buffer -> logger.info("Async Download Response: Received buffer with size {}", buffer.length()),
                    failure -> logger.error("Async Download Failure: {}", failure.getMessage())
            );

            // List files using async client
            Uni<List<FileObject>> asyncFileList = asyncResource.listFiles();
            asyncFileList.subscribe().with(
                    fileList -> logger.info("Async List Files: {}", fileList),
                    failure -> logger.error("Async List Files Failure: {}", failure.getMessage())
            );

            // Delete file using async client
            Uni<Response> asyncDeleteResponse = asyncResource.deleteFile("your-file-name");
            asyncDeleteResponse.subscribe().with(
                    response -> logger.info("Async Delete Response: {}", response.getStatus()),
                    failure -> logger.error("Async Delete Failure: {}", failure.getMessage())
            );
        }
    }
}
