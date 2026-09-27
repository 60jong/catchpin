# CLAUDE.md — pincatch server

Spring Boot backend for pincatch. Java 21, Gradle (Groovy DSL), JPA, PostgreSQL.

## Package structure

Package-by-domain (feature), not by layer. Each domain gets its own top-level package under `com.pincatch.server.<domain>`, with the same fixed set of sub-packages:

- `<domain>.domain.entity` — JPA `@Entity` classes for this domain, plus enums that belong to an entity's column (e.g. `AuthProviderType`).
- `<domain>.domain` — everything else that isn't an entity but belongs to the domain's vocabulary: service-layer return types (e.g. `AuthResult`), API request/response DTOs (e.g. `GoogleLoginRequest`, `AuthResponse`), and domain exceptions (e.g. `InvalidGoogleTokenException`). API DTOs live here too — no separate `dto`/`web` split.
- `<domain>.repository` — `JpaRepository` (or other) repository interfaces.
- `<domain>.service` — service classes. **No interface + impl split** — service implementations essentially never get swapped out, so an interface would just be ceremony. Skip it.
- `<domain>.controller` — `@RestController` classes and any `@RestControllerAdvice` exception handlers for this domain.

Cross-cutting infrastructure that isn't owned by one domain (e.g. `BaseEntity`) goes in `com.pincatch.server.common`.

## Cross-domain rule

A domain may only use another domain's **behavior** through that domain's Service — never by injecting another domain's Repository directly, and never by re-implementing its logic locally.

- Example: signup/login logic needs to look up or create a `Member`. That logic lives in `auth.service.AuthService`, and `AuthService` calls `member.service.MemberService` (which wraps `MemberRepository`) — it does not inject `MemberRepository` itself. Login/signup is an `auth`-domain concern even though it touches `Member`, so it does not belong inside `MemberService`.

This does **not** apply to entity references. A `@ManyToOne`/`@OneToMany` from one domain's entity to another domain's entity (e.g. `auth.domain.entity.AuthProvider` holding a `Member`) is normal data modeling, not a "using another domain's functionality" — only orchestration/business-logic calls need to go through the other domain's Service.

## Reference example (`auth` + `member`)

```
member/
  domain/entity/Member.java
  repository/MemberRepository.java
  service/MemberService.java        # findOrCreateByEmail(email), etc.

auth/
  domain/entity/AuthProvider.java   # @ManyToOne Member — fine, it's just a FK
  domain/entity/RefreshToken.java
  domain/entity/AuthProviderType.java
  domain/AuthResult.java            # service-layer return DTO
  domain/GoogleLoginRequest.java    # API request DTO — same package as above
  domain/AuthResponse.java          # API response DTO
  domain/InvalidGoogleTokenException.java
  repository/AuthProviderRepository.java
  repository/RefreshTokenRepository.java
  service/AuthService.java          # calls member.service.MemberService, not MemberRepository
  service/GoogleTokenVerifier.java
  service/JwtProvider.java
  service/RefreshTokenService.java
  controller/AuthController.java
  controller/AuthExceptionHandler.java
```
