# catchpin

## Structure

- `apps/mobile` — React Native app (Expo)
- `apps/server` — Spring Boot API (Java, Gradle)
- `apps/web` — 대표 웹페이지 (정적 HTML, catchpin.60jong.dev)

Each app manages its own dependencies and build independently (plain folder split, no shared monorepo tooling).

## Mobile (`apps/mobile`)

```
cd apps/mobile
npm install
npm run ios      # or android / web
```

## Server (`apps/server`)

```
cd apps/server
./gradlew bootRun
```
