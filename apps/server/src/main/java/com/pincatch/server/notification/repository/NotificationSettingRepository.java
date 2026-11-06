package com.pincatch.server.notification.repository;

import com.pincatch.server.notification.domain.entity.NotificationSetting;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

	Optional<NotificationSetting> findByMember_Id(Long memberId);

	List<NotificationSetting> findAllByMember_IdIn(Collection<Long> memberIds);

	@Query("select s.member.id from NotificationSetting s where s.marketingAgreed = true")
	List<Long> findMemberIdsByMarketingAgreed();
}
