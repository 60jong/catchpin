package com.pincatch.server.auth.domain.entity;

import com.pincatch.server.common.BaseEntity;
import com.pincatch.server.member.domain.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(
		name = "auth_provider",
		uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_user_id"}))
public class AuthProvider extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AuthProviderType provider;

	@Column(name = "provider_user_id")
	private String providerUserId;

	private String passwordHash;

	public AuthProvider(Member member, AuthProviderType provider, String providerUserId) {
		this(member, provider, providerUserId, null);
	}

	public AuthProvider(Member member, AuthProviderType provider, String providerUserId, String passwordHash) {
		this.member = member;
		this.provider = provider;
		this.providerUserId = providerUserId;
		this.passwordHash = passwordHash;
	}
}
