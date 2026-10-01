# CLAUDE.md — catchpin server

Spring Boot 백엔드. Java 21, Gradle(Groovy DSL), JPA, PostgreSQL.

## 패키지 규칙

- 레이어별이 아니라 **도메인(기능)별**로 최상위 패키지를 나눈다 (`com.catchpin.server.<domain>`).
- 각 도메인 패키지 하위 구조는 고정:
  - `<domain>.domain.entity` — JPA 엔티티, 엔티티 컬럼에 쓰이는 enum
  - `<domain>.domain` — 엔티티 아닌 것 전부 (서비스 반환 DTO, API 요청/응답 DTO). API DTO도 여기 같이 둔다 — 따로 안 나눔
  - `<domain>.repository` — Repository 인터페이스
  - `<domain>.service` — 서비스 클래스. **인터페이스 안 만든다** (구현체 안 바뀌므로 불필요한 껍데기)
  - `<domain>.controller` — `@RestController`
  - `<domain>.exception` — 이 도메인 전용 예외
- 여러 도메인이 공유하는 것(`BaseEntity`, 공통 예외 처리)은 `common` 패키지에 둔다.

## 도메인 간 접근 규칙

- 다른 도메인의 **기능(비즈니스 로직)**은 그 도메인의 Service를 통해서만 쓴다. 다른 도메인의 Repository를 직접 주입하거나 로직을 복제하지 않는다.
  - 예: 회원가입/로그인 로직은 `auth.service.AuthService`에 있고, `AuthService`가 `member.service.MemberService`를 호출한다. `MemberRepository`를 직접 쓰지 않는다.
- 단, **엔티티 참조(FK)는 예외** — `@ManyToOne` 등으로 다른 도메인 엔티티를 참조하는 건 정상적인 데이터 모델링이라 규칙 대상 아님.

## 엔티티

- 모든 엔티티는 `BaseEntity`(`common`)를 상속 — `createdAt`/`modifiedAt` 자동 관리.
- Lombok `@Getter` 사용, setter는 안 만들고 필요한 동작만 메서드로 노출.

## 응답

- 성공 응답은 컨트롤러가 도메인 DTO를 그대로 반환하지 않고 `common.response.ApiResponse<T>`로 감싼다 (`ApiResponse.success(data)`) — `{ "success": true, "data": {...} }` 형태.
- 에러 응답은 감싸지 않는다 — 아래 예외 처리 규칙(`ProblemDetail`)을 그대로 따른다.

## 예외 처리

- 모든 예외는 `common.exception.CatchPinException`(추상 클래스)을 상속하고, 생성자에서 `HttpStatus`를 넘긴다.
- 예외 → HTTP 응답 변환은 `common.exception.GlobalExceptionHandler` 하나가 전담 (`ProblemDetail`, RFC 7807 형식). 도메인별로 따로 예외 핸들러를 만들지 않는다.
