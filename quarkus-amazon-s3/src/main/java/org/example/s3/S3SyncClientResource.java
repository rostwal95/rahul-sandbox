package org.example.s3;

import java.io.File;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Path("/s3")
public class S3SyncClientResource extends CommonResource {
    private static final Logger logger = LoggerFactory.getLogger(S3SyncClientResource.class);

    @Inject
    S3Client s3;

    @POST
    @Path("upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(FormData formData) {
        try {
            if (formData.filename == null || formData.filename.isEmpty()) {
                logger.error("Filename is missing");
                return Response.status(Status.BAD_REQUEST).entity("Filename is required").build();
            }

            if (formData.mimetype == null || formData.mimetype.isEmpty()) {
                logger.error("Mimetype is missing");
                return Response.status(Status.BAD_REQUEST).entity("Mimetype is required").build();
            }

            File filePath = formData.data;
            long fileSize = Files.size(filePath.toPath());

            if (fileSize == 0) {
                logger.error("Uploaded file is empty");
                return Response.status(Status.BAD_REQUEST).entity("Uploaded file is empty").build();
            }

            logger.info("Uploading file: {} (Size: {} bytes)", filePath.getAbsolutePath(), fileSize);

            byte[] fileContent = Files.readAllBytes(filePath.toPath());
            logger.debug("First 100 bytes of the file: {}", Arrays.toString(Arrays.copyOf(fileContent, Math.min(100, fileContent.length))));

            if (fileContent.length != fileSize) {
                logger.error("File size mismatch: expected {} bytes but read {} bytes", fileSize, fileContent.length);
                return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File size mismatch").build();
            }

            PutObjectRequest putObjectRequest = buildPutRequest(formData);
            PutObjectResponse putResponse = s3.putObject(putObjectRequest, RequestBody.fromBytes(fileContent));

            if (putResponse.sdkHttpResponse().isSuccessful()) {
                logger.info("File {} uploaded successfully. ETag: {}", formData.filename, putResponse.eTag());
                return Response.status(Status.CREATED).entity("File uploaded successfully. ETag: " + putResponse.eTag()).build();
            } else {
                logger.error("File upload failed for file {}", formData.filename);
                return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File upload failed.").build();
            }
        } catch (Exception e) {
            logger.error("File upload failed", e);
            return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File upload failed: " + e.getMessage()).build();
        }
    }

    @GET
    @Path("download/{objectKey}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadFile(@PathParam("objectKey") String objectKey) {
        try {
            logger.info("Downloading file: {}", objectKey);
            ResponseBytes<GetObjectResponse> objectBytes = s3.getObjectAsBytes(buildGetRequest(objectKey));
            Response.ResponseBuilder response = Response.ok(objectBytes.asByteArray());
            response.header("Content-Disposition", "attachment;filename=" + objectKey);
            response.header("Content-Type", objectBytes.response().contentType());
            return response.build();
        } catch (Exception e) {
            logger.error("File download failed", e);
            return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File download failed: " + e.getMessage()).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<FileObject> listFiles() {
        logger.info("Listing files in bucket: {}", bucketName);
        ListObjectsRequest listRequest = ListObjectsRequest.builder().bucket(bucketName).build();
        return s3.listObjects(listRequest).contents().stream()
                .map(FileObject::from)
                .sorted(Comparator.comparing(FileObject::getObjectKey))
                .collect(Collectors.toList());
    }

    @DELETE
    @Path("delete/{objectKey}")
    public Response deleteFile(@PathParam("objectKey") String objectKey) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            DeleteObjectResponse deleteObjectResponse = s3.deleteObject(deleteObjectRequest);

            if (deleteObjectResponse.sdkHttpResponse().isSuccessful()) {
                logger.info("File {} deleted successfully.", objectKey);
                return Response.status(Status.NO_CONTENT).build();
            } else {
                logger.error("File deletion failed for file {}", objectKey);
                return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File deletion failed.").build();
            }
        } catch (Exception e) {
            logger.error("File deletion failed", e);
            return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File deletion failed: " + e.getMessage()).build();
        }
    }
}
