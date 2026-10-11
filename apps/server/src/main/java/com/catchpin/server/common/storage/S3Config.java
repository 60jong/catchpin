package com.catchpin.server.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * S3 클라이언트/presigner 빈. 자격증명은 SDK 기본 체인(EC2 인스턴스 롤, 환경변수, ~/.aws 등)에 맡기고 코드에 키를 두지 않는다.
 * 자격증명은 실제로 S3를 부르는 순간에 풀리므로, 자격증명이 없는 로컬에서도 앱 기동 자체는 된다.
 */
@Configuration
public class S3Config {

	@Bean
	public S3Presigner s3Presigner(@Value("${catchpin.storage.region:ap-northeast-2}") String region) {
		return S3Presigner.builder().region(Region.of(region)).build();
	}

	@Bean
	public S3Client s3Client(@Value("${catchpin.storage.region:ap-northeast-2}") String region) {
		return S3Client.builder().region(Region.of(region)).build();
	}
}
