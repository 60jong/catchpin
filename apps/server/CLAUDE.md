# CLAUDE.md — catchpin server

Spring Boot 백엔드. Java 21, Gradle(Groovy DSL), JPA, PostgreSQL.

## 패키지 규칙

- 레이어별이 아니라 **도메인(기능)별**로 최상위 패키지를 나눈다 (`com.catchpin.server.<domain>`).
- 각 도메인 패키지 하위 구조는 고정:
  - `<domain>.domain.entity` — JPA 엔티티, 엔티티 컬럼에 쓰이는 enum
  - `<domain>.domain` — 엔티티 아닌 것 전부 (서비스 결과 객체 `XxxResult`, API 요청/응답 DTO). API DTO도 여기 같이 둔다 — 따로 안 나눔
  - `<domain>.repository` — Repository 인터페이스
  - `<domain>.service` — 서비스 클래스. **인터페이스 안 만든다** (구현체 안 바뀌므로 불필요한 껍데기)
  - `<domain>.controller` — `@RestController`
  - `<domain>.exception` — 이 도메인 전용 예외
- 여러 도메인이 공유하는 것(`BaseEntity`, 공통 예외 처리)은 `common` 패키지에 둔다.

## 도메인 간 접근 규칙

- 다른 도메인의 **기능(비즈니스 로직)**은 그 도메인의 Service를 통해서만 쓴다. 다른 도메인의 Repository를 직접 주입하거나 로직을 복제하지 않는다.
  - 예: 회원가입/로그인 로직은 `auth.service.AuthService`에 있고, `AuthService`가 `member.service.MemberService`를 호출한다. `MemberRepository`를 직접 쓰지 않는다.
- 단, **엔티티 참조(FK)는 예외** — `@ManyToOne` 등으로 다른 도메인 엔티티를 참조하는 건 정상적인 데이터 모델링이라 규칙 대상 아님.
- **도메인 패키지끼리 순환 참조를 만들지 않는다** (`a → b → a`). 순환이 생길 것 같으면 의존 방향을 한쪽으로 정한다.
  - 기본 방향: `member`는 다른 도메인이 쓰는 기반이라 `auth`/`ads`/`capture`가 `member`를 부르고, `member`는 그들을 부르지 않는다.
  - 탈퇴·내 데이터 내보내기처럼 **여러 도메인을 한꺼번에 건드리는 흐름**은 어느 한 도메인에 두지 않고 `account` 도메인에 둔다 (`account.service.WithdrawalService`, `MemberExportService`). `account`는 다른 도메인의 서비스를 마음껏 부르는 가장 위쪽이고, 아무도 `account`를 부르지 않는다. 주소는 그대로 `/api/v1/members/me/...`.
  - 컨트롤러·응답 DTO가 여러 도메인의 값을 조합하는 것은 순환으로 보지 않는다 (서비스끼리의 호출과 엔티티 참조만 본다).

## 레이어 간 데이터 규칙

서비스 규모가 커지기 전까지는 복잡한 설계(유스케이스별 Command, 포트/어댑터 등)를 도입하지 않는다. 아래 규칙만 지킨다.

- **컨트롤러 → 서비스**: 컨트롤러가 요청 DTO(`@RequestBody`)에서 필요한 값을 꺼내 서비스에 넘긴다. **API 요청 DTO를 서비스에 그대로 넘기지 않는다.** 값이 많아 읽기 힘들면 서비스 전용 입력 객체를 만들어도 된다.
- **서비스 반환**: **API 응답 DTO도, 엔티티도 반환하지 않는다.** 필요한 값만 담은 서비스 결과 객체(`XxxResult` 레코드, 도메인 용어로 이름 짓는다 — 예: `AuthResult`, `ClaimResult`)를 반환하거나, 값 하나·`void`면 그대로 반환한다. 컨트롤러가 결과 객체를 응답 DTO로 변환한다.
- **OSIV는 끈다** (`spring.jpa.open-in-view=false`). 트랜잭션 밖(컨트롤러)에서 엔티티의 지연 로딩 필드를 읽지 않는다 — 이 규칙(서비스가 엔티티를 안 돌려줌)이 그걸 보장한다.
- 서비스끼리는 엔티티를 주고받아도 된다 (같은 트랜잭션 안이므로). 단, 컨트롤러까지 올라오면 안 된다.

### 컨트롤러가 리포지토리를 직접 쓰는 예외

단순 조회이면서 성능이 중요할 때만, 컨트롤러가 리포지토리를 직접 호출할 수 있다. 조건:

- **읽기 전용**이고 비즈니스 규칙이 없다.
- **자기 도메인의 리포지토리만** 쓴다. 다른 도메인 리포지토리 금지는 그대로다.
- OSIV가 꺼져 있어 엔티티는 지연 로딩이 안 되므로, 필요한 컬럼만 담은 **프로젝션**(인터페이스 또는 레코드)을 리포지토리가 직접 돌려주게 하고, 그걸 응답 DTO로 변환한다. 엔티티를 컨트롤러에서 다루지 않는다.
- 조건이 하나라도 안 맞으면 서비스를 거친다.

### 적용 방식과 현재 위반 (코드가 아직 규칙을 못 지키는 곳)

- **새 코드는 이 규칙대로 쓴다.** 기존 위반은 점진적으로 고치고, 고치면서 이 목록에서 지운다.
- OSIV(`open-in-view`)는 지금 설정이 없어 Boot 기본값(켜짐)이다. 위반을 모두 정리한 **마지막에** 끈다 (먼저 끄면 컨트롤러의 지연 로딩이 깨진다).
- 서비스가 응답 DTO를 반환: `AdRewardService`(`AdRewardRequestResponse`, `AdRewardStatusResponse`), `PhoneVerificationService.issueCode`(`PhoneCodeResponse`), `InviteService.getInfo`, `ProfileImageService.createUpload`, `NotificationSettingService`, `MemberExportService`, `PinService.ping`(`PingResponse`).
- 서비스가 엔티티를 반환해 컨트롤러가 응답으로 변환: `MemberService`의 다수 메서드(`getCurrentState`, `updateProfile`, `updateSimpleNotificationsOnly`, `verifyPhone` 등), `PhoneVerificationService.verify`, `RefreshTokenService.rotate`. 컨트롤러의 `toResponse(Member)`가 해당한다.
- 서비스가 API 요청 DTO를 받음: `NotificationSettingService.update(memberId, UpdateNotificationSettingsRequest)`.
- 도메인 의존: 서비스와 엔티티 사이의 순환은 없다 (`account → ads/auth/capture/member`, `ads/auth/capture → member`). 다만 `member`의 컨트롤러·`MemberMeResponse`가 `auth`(로그인 방식)와 `capture`(위치 삭제)를 참조해서 import 상으로는 `member ↔ auth`, `member ↔ capture`가 남아 있다 — 위의 "컨트롤러·응답 DTO는 순환으로 보지 않는다" 예외에 해당한다.

## 엔티티

- 모든 엔티티는 `BaseEntity`(`common`)를 상속 — `createdAt`/`modifiedAt` 자동 관리.
- Lombok `@Getter` 사용, setter는 안 만들고 필요한 동작만 메서드로 노출.

## 응답

- 성공 응답은 컨트롤러가 도메인 DTO를 그대로 반환하지 않고 `common.response.ApiResponse<T>`로 감싼다 (`ApiResponse.success(data)`) — `{ "success": true, "data": {...} }` 형태.
- 에러 응답은 감싸지 않는다 — 아래 예외 처리 규칙(`ProblemDetail`)을 그대로 따른다.

## 예외 처리

- 모든 예외는 `common.exception.CatchPinException`(추상 클래스)을 상속하고, 생성자에서 `HttpStatus`를 넘긴다.
- 예외 → HTTP 응답 변환은 `common.exception.GlobalExceptionHandler` 하나가 전담 (`ProblemDetail`, RFC 7807 형식). 도메인별로 따로 예외 핸들러를 만들지 않는다.

## 로깅

운영은 콘솔 → journald, 그리고 OTel 로그 어펜더로 Grafana Cloud(Loki)에도 간다 (`logback-spring.xml`, `application-prod.yml`). 로그는 **"장애 때 무슨 일이 있었는지 한 요청 단위로 따라갈 수 있게"** 쓴다. 새 코드를 쓸 때 아래 규칙을 따르고, 규칙을 바꾸면 이 절도 같이 고친다.

### 구조 (이미 갖춰져 있음 — 새로 만들지 말고 쓴다)
- `common.logging.RequestLoggingFilter`: 요청마다 `requestId`를 만들어 MDC에 넣고(콘솔 로그 줄 `[requestId]`, 응답 헤더 `X-Request-Id`, Loki 속성) 끝나면 접근 로그 한 줄을 남긴다 (`[요청] GET /path 200 12ms memberId=.. ip=..`). 헬스체크(`/actuator/health`)는 제외. 5xx와 1초 이상은 WARN, 나머지는 INFO.
- `memberId`는 `CurrentMemberIdArgumentResolver`가 인증에 성공할 때 MDC에 넣는다. 그래서 인증 필요한 요청의 모든 로그에 자동으로 따라붙는다. 인증이 없는 요청(로그인 등)은 null이다.
- `common.exception.GlobalExceptionHandler`: 예외 로그는 **여기서만** 남긴다. 5xx `CatchPinException`과 예상 못 한 예외(`Exception`)는 ERROR + 스택트레이스, 4xx는 로그하지 않는다 (접근 로그의 상태 코드로 충분). 예상 못 한 예외의 응답은 내부 메시지 없이 고정 문구 500. `ResponseEntityExceptionHandler`를 상속하고 있어 400/404/405 같은 Spring MVC 예외는 원래 상태를 유지한다 — 상속을 빼면 전부 500이 되니 빼지 말 것 (`GlobalExceptionHandlerTest`가 막는다).

### 레벨
| 레벨 | 쓰는 때 |
|---|---|
| ERROR | 서버 잘못이라 사람이 봐야 하는 것: 처리 못 한 예외, 5xx. **알림 대상** — 남발하면 알림이 무의미해진다. 사용자 입력 오류는 절대 ERROR가 아니다. |
| WARN | 정상 흐름은 아니지만 서버가 처리했고 계속 보면 이상한 것: 외부 연동 실패(Octomo 등), 로그인 실패, 폐기·만료된 리프레시 토큰 재사용 시도, 개발용 기능이 켜져 있음, 느린 요청. |
| INFO | **비즈니스 이벤트**: 상태가 바뀐 사건 하나당 한 줄 (가입, 로그인, 핀 선점 성공/실패, 탭권 충전, 인증 완료, 탈퇴 등). 읽기(GET) 조회는 INFO로 남기지 않는다. |
| DEBUG | 개발 중 추적용. 운영 기본 레벨이 INFO라 나가지 않는다. 커밋에 남겨도 된다. |

### 형식
- 한국어, `[도메인] 사건 key=value ...` 한 줄. 예: `log.info("[핀] 선점 성공 memberId={} pinId={} points={}", ...)`. 기존 `[인증]`, `[핀]`, `[탭권]`, `[초대]`, `[휴대폰 인증]`, `[요청]`, `[예외]` 접두어를 재사용한다.
- 로그 줄에는 항상 **누가(memberId) 무엇을(id) 어떻게 됐는지(결과)**가 들어가야 한다. memberId는 서비스의 인자로 이미 있으니 명시적으로도 적는다 (요청 밖, 예: 스케줄러에서도 읽히게).
- SLF4J 파라미터 `{}`를 쓰고 문자열을 `+`로 이어 붙이지 않는다. 예외를 로그할 땐 **마지막 인자로 예외 객체**를 넘겨 스택트레이스를 남긴다 (`log.warn("..", x, e)`), `e.getMessage()`만 쓰지 않는다.
- 클래스에 `@Slf4j`를 붙여 `log`를 쓴다.

### 절대 로그에 남기지 않는 것
액세스/리프레시/ID 토큰, 비밀번호, API 키(`OCTOMO_API_KEY` 등)·시크릿, 요청·응답 본문 전체, 쿼리스트링(토큰이 섞일 수 있어 접근 로그도 경로만), 이메일 전체, 휴대폰 번호 전체(`010****5678`처럼 마스킹, 서비스의 `mask()` 참고), 인증 코드(개발용 `dev-approve`만 예외), 위치 좌표. 사람을 가리킬 땐 `memberId`만 쓴다. 로그인 실패 로그에도 이메일을 넣지 않는다 (반복 시도는 ip로 본다).

### 같은 사건을 두 번 로그하지 않는다
- 예외는 던지는 쪽이 아니라 `GlobalExceptionHandler`가 한 번만 로그한다. 서비스에서 `log.error(..); throw new ...` 하지 않는다. (외부 연동처럼 **원인 예외를 응답에 못 싣는** 곳은 예외로, 원인과 함께 한 번 로그하고 던지는 걸 허용한다 — 예: Octomo 호출 실패.)
- 사용자의 잘못된 입력(4xx)은 서비스에서 로그하지 않는다. 단, 보안 신호가 되는 것(로그인 실패, 리프레시 토큰 재사용)은 WARN으로 남긴다.
- 트랜잭션 안에서 상태를 바꾼 뒤에 로그를 남긴다. 롤백되는 경우 로그가 남을 수 있다는 점은 감수한다 (정확한 기록이 필요한 사건은 `afterCommit` 훅에서 남긴다).

### 앞으로 할 일 / 참고
- 새 도메인(광고 보상 SSV 등)을 추가하면 이벤트 로그를 같이 넣는다. 광고 보상은 `[광고]` 접두어로 지급·거부(서명 불일치, 중복 `transaction_id`)를 남기고, 서명 불일치는 WARN이다.
- 지금은 MDC 값(`requestId`, `memberId`)을 Loki에서 검색할 수 있다. 알림 규칙을 만들 땐 `[예외]` ERROR 건수와 `[요청]` WARN(5xx)을 기준으로 삼는다.
- 구조화(JSON) 로그는 아직 쓰지 않는다. 로그 양이 늘어 Loki 쿼리가 불편해지면 그때 도입한다 (지금은 MDC 속성 + 접두어로 충분).
