package com.pincatch.server.member.domain.entity;

import com.pincatch.server.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "member")
public class Member extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true)
	private String email;

	private String nickname;

	private String avatarId;

	@Column(nullable = false)
	private int pointBalance = 0;

	@Column(nullable = false)
	private boolean profileComplete = false;

	public Member(String email) {
		this.email = email;
	}

	public void completeProfile(String nickname, String avatarId) {
		this.nickname = nickname;
		this.avatarId = avatarId;
		this.profileComplete = true;
	}
}
