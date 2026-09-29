# catch pin

주변 사용자의 핀을 가장 먼저 눌러 포인트를 얻는 위치 기반 앱테크 앱. 광고 시청으로 탭권을 충전하는 수익 모델.

## 참고 문서
- 디자인 기준: `design/DESIGN_SPEC.md` (색·글꼴·크기·애니메이션 타이밍은 여기를 따를 것)
- 원본 화면 마크업: `design/screens/*.dc.html` (정확한 좌표·크기 확인용)

## 기술 스택
- Expo (최신 SDK) + TypeScript (strict) + Expo Router
- 애니메이션: react-native-reanimated, 레이더·핀 그래픽: @shopify/react-native-skia
- 위치: expo-location
- 폰트: @expo-google-fonts/gothic-a1, @expo-google-fonts/sora
- 이후 단계: AdMob(react-native-google-mobile-ads), 카카오/Apple/Google 로그인, 백엔드(Supabase)
- 광고·카카오·구글 로그인을 붙이기 전까지는 Expo Go에서 실행 가능하게 유지

## 폴더 구조
- `app/` 화면 (Expo Router)
- `src/theme/` 디자인 토큰 (colors, typography, radius)
- `src/components/` 공통 컴포넌트 (PinButton, Card, PrimaryButton, TopBar, TabBar, Radar 등)
- `src/data/` 데이터 접근 계층. 초기에는 mock 구현, 나중에 서버 구현으로 교체
- `design/` 디자인 명세와 원본 화면

## 규칙
- 색·글꼴·크기는 반드시 `src/theme`의 토큰을 사용하고 하드코딩하지 말 것
- 화면은 데이터 계층 인터페이스만 사용 (mock ↔ 실서버 교체가 쉽도록)
- 핀 선점 판정은 클라이언트에서 결정하지 않음. 항상 데이터 계층의 `claimPin()` 결과를 따름
- 핀에 소유자 이름·사진을 표시하지 않음
- 모든 터치 영역 최소 44pt, 애니메이션은 '동작 줄이기' 설정 존중
- 새 기능을 만들면 iOS 시뮬레이터에서 실행해 확인
