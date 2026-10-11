package com.catchpin.server.member.domain.entity;

import com.catchpin.server.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 누가 누구의 초대 코드로 가입했는지 — 초대받은 사람(invitee)은 한 번만 코드를 쓸 수 있다(unique). */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "invitation")
public class Invitation extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "inviter_id")
	private Member inviter;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "invitee_id", unique = true)
	private Member invitee;

	public Invitation(Member inviter, Member invitee) {
		this.inviter = inviter;
		this.invitee = invitee;
	}
}
