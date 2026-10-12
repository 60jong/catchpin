# web — 대표 웹페이지

`catchpin.60jong.dev`에 올라가는 정적 랜딩 페이지. 빌드 단계 없이 파일 그대로 배포한다.

- `index.html` — 디자인 원본 `design/screens/Landing.dc.html`을 일반 HTML로 옮긴 것
- `faq.js` — FAQ 아코디언
- `favicon.svg` — 로고

## 로컬에서 보기

```
cd apps/web
python3 -m http.server 8080   # http://localhost:8080
```

## 배포

`main`에 `apps/web/**`가 바뀌어 푸시되면 `.github/workflows/deploy-web.yml`이 Vercel에 올린다.
모바일 웹 미리보기와는 다른 Vercel 프로젝트를 쓴다 (`VERCEL_WEB_PROJECT_ID`).

## 아직 채워야 할 것

- App Store / Google Play 링크 (`href="#"`)
- 약관·개인정보처리방침·위치기반서비스 약관·고객센터 링크
- 푸터 사업자 정보 `[회사명]` 등, FAQ의 광고 충전 한도 `[N]회`
