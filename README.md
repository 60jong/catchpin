# pincatch

## Structure

- `apps/mobile` — React Native app (Expo)
- `apps/server` — Spring Boot API (Java, Gradle)

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
