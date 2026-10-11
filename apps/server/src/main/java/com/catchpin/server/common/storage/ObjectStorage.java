package com.catchpin.server.common.storage;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * S3 접근을 감싼 얇은 래퍼 — 업로드는 서버를 거치지 않고 클라이언트가 presigned URL로 S3에 직접 올린다.
 * 읽기는 CloudFront(공개)로 하므로 DB에는 URL이 아니라 키만 저장하고, 화면에 줄 때 publicUrl로 조립한다.
 */
@Component
public class ObjectStorage {

	private final S3Presigner presigner;
	private final S3Client s3Client;
	private final String bucket;
	private final String publicBaseUrl;

	public ObjectStorage(
			S3Presigner presigner,
			S3Client s3Client,
			@Value("${catchpin.storage.bucket:}") String bucket,
			@Value("${catchpin.storage.public-base-url:}") String publicBaseUrl) {
		this.presigner = presigner;
		this.s3Client = s3Client;
		this.bucket = bucket;
		this.publicBaseUrl = publicBaseUrl;
	}

	/**
	 * 업로드용 presigned PUT URL. contentType과 contentLength를 서명에 포함시키므로,
	 * 클라이언트가 다른 타입이나 다른 크기로 올리면 S3가 서명 불일치로 거부한다.
	 */
	public String presignPut(String key, String contentType, long contentLength, Duration ttl) {
		PutObjectRequest put = PutObjectRequest.builder()
				.bucket(bucket)
				.key(key)
				.contentType(contentType)
				.contentLength(contentLength)
				.build();
		PutObjectPresignRequest request = PutObjectPresignRequest.builder()
				.signatureDuration(ttl)
				.putObjectRequest(put)
				.build();
		return presigner.presignPutObject(request).url().toString();
	}

	/** 객체를 지운다 (없어도 에러 없이 끝난다 — S3 삭제는 멱등이다). */
	public void delete(String key) {
		s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
	}

	/** CloudFront 공개 URL. */
	public String publicUrl(String key) {
		return publicBaseUrl + "/" + key;
	}
}
