package com.catchpin.server.member.domain;

/**
 * 친구 초대 화면 정보.
 * rewardPoints는 초대 보상으로 받은 포인트 합계 — 보상 지급은 "친구가 첫 핀을 잡을 때"인데 핀 판정이 아직 서버에 없어서 지금은 항상 0이다.
 */
public record InviteResponse(String code, long invitedCount, long rewardPoints, int monthlyLimit) {
}
