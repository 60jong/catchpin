package com.catchpin.server.capture.domain;

import com.catchpin.server.common.geo.GeoPoint;

/**
 * 요청자 주변에서 발견된 유저 1명 — NearbyFinder의 검색 결과 한 건.
 * 서버 내부용 모델이다. 핀은 익명이고 정확한 위치는 비공개라서, 클라이언트 응답에는 memberId·location을 그대로 싣지 말고
 * 거리/방위 정도로 가공해서 내려보낸다.
 *
 * @param memberId 발견된 유저 — 서버가 핀 선점 판정 등에 쓰는 식별자 (클라이언트에 노출 금지)
 * @param location 발견 시점에 캐시돼 있던 그 유저의 위치
 * @param distanceMeter 요청자 위치로부터의 거리(미터)
 */
public record Nearby(long memberId, GeoPoint location, double distanceMeter) {
}
