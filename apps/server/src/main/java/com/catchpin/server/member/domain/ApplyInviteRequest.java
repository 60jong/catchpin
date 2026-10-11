package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/invite/apply 요청 — 친구에게 받은 초대 코드. */
public record ApplyInviteRequest(String code) {
}
