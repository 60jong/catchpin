package com.catchpin.server.capture.repository;

import com.catchpin.server.capture.domain.entity.MemberLocation;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberLocationRepository extends JpaRepository<MemberLocation, Long> {

	/**
	 * 위치를 "있으면 갱신, 없으면 삽입"으로 한 번에 저장한다 (PostgreSQL upsert).
	 * 같은 사용자의 첫 ping이 거의 동시에 두 번 오면 둘 다 "행이 없다"고 보고 삽입하다 기본키가 충돌하므로, 이 판단을 DB에 맡긴다.
	 */
	@Modifying
	@Query(
			value = "insert into member_location (member_id, latitude, longitude, last_ping_at, created_at, modified_at) "
					+ "values (:id, :lat, :lng, :now, :now, :now) "
					+ "on conflict (member_id) do update set latitude = :lat, longitude = :lng, last_ping_at = :now, modified_at = :now",
			nativeQuery = true)
	void upsertPing(@Param("id") Long memberId, @Param("lat") double lat, @Param("lng") double lng, @Param("now") LocalDateTime now);

	// 활성 사용자 — 최근에 위치를 보냈거나, 항상 켜져 있는 개발용 봇
	@Query("select l from MemberLocation l join fetch l.member m where l.lastPingAt >= :since or m.bot = true")
	List<MemberLocation> findActive(@Param("since") LocalDateTime since);
}
