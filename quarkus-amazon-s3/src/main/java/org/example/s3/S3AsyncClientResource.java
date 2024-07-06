package org.example.s3;

import java.nio.ByteBuffer;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import mutiny.zero.flow.adapters.AdaptersToFlow;

import org.jboss.resteasy.reactive.RestMulti;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import io.vertx.core.buffer.Buffer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.core.async.AsyncResponseTransformer;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsResponse;

@Path("/async-s3")
public class S3AsyncClientResource extends CommonResource {

    Logger logger = LoggerFactory.getLogger(S3AsyncClientResource.class);

    @Inject
    S3AsyncClient s3;

    @POST
    @Path("upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Uni<Response> uploadFile(FormData formData) {

        logger.info("Uploading file : {}", formData.filename);
        if (formData.filename == null || formData.filename.isEmpty()) {
            return Uni.createFrom().item(Response.status(Status.BAD_REQUEST).build());
        }

        if (formData.mimetype == null || formData.mimetype.isEmpty()) {
            return Uni.createFrom().item(Response.status(Status.BAD_REQUEST).build());
        }

        return Uni.createFrom()
                .completionStage(() -> {
                    return s3.putObject(buildPutRequest(formData), AsyncRequestBody.fromFile(formData.data));
                })
                .onItem().ignore().andSwitchTo(Uni.createFrom().item(Response.created(null).build()))
                .onFailure().recoverWithItem(th -> {
                    logger.error("Error while uploading file : {}", th.getMessage());
                    return Response.serverError().build();
                });
    }

    @GET
    @Path("download/{objectKey}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public RestMulti<Buffer> downloadFile(String objectKey) {

        logger.info("Downloading file : {}", objectKey);
        return RestMulti.fromUniResponse(Uni.createFrom()
                        .completionStage(() -> s3.getObject(buildGetRequest(objectKey),
                                AsyncResponseTransformer.toPublisher())),
                response -> Multi.createFrom().safePublisher(AdaptersToFlow.publisher(response))
                        .map(S3AsyncClientResource::toBuffer),
                response -> Map.of("Content-Disposition", List.of("attachment;filename=" + objectKey), "Content-Type",
                        List.of(response.response().contentType())));
    }

    @GET
    public Uni<List<FileObject>> listFiles() {
        logger.info("Listing all files in the bucket : {}", bucketName);
        ListObjectsRequest listRequest = ListObjectsRequest.builder()
                .bucket(bucketName)
                .build();

        return Uni.createFrom().completionStage(() -> s3.listObjects(listRequest))
                .onItem().transform(this::toFileItems);
    }

    @DELETE
    @Path("delete/{objectKey}")
    public Uni<Response> deleteFile(@PathParam("objectKey") String objectKey) {
        logger.info("Deleting file : {}", objectKey);
        return Uni.createFrom()
                .completionStage(() -> {
                    DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build();
                    return s3.deleteObject(deleteObjectRequest);
                })
                .onItem().transform(deleteObjectResponse -> {
                    if (deleteObjectResponse.sdkHttpResponse().isSuccessful()) {
                        logger.info("File {} deleted successfully.", objectKey);
                        return Response.status(Status.NO_CONTENT).build();
                    } else {
                        logger.error("File deletion failed for file {}", objectKey);
                        return Response.status(Status.INTERNAL_SERVER_ERROR).entity("File deletion failed.").build();
                    }
                })
                .onFailure().recoverWithItem(th -> {
                    logger.error("Error while deleting file : {}", th.getMessage());
                    return Response.serverError().build();
                });
    }

    private static Buffer toBuffer(ByteBuffer bytebuffer) {
        byte[] result = new byte[bytebuffer.remaining()];
        bytebuffer.get(result);
        return Buffer.buffer(result);
    }

    private List<FileObject> toFileItems(ListObjectsResponse objects) {
        return objects.contents().stream()
                .map(FileObject::from)
                .sorted(Comparator.comparing(FileObject::getObjectKey))
                .collect(Collectors.toList());
    }
}