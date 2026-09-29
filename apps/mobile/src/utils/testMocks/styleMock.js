// 테스트 환경에서 .css import를 무시하기 위한 목업. jest.config(package.json)의
// moduleNameMapper에서 사용한다 — 웹 전용(react-native-web) CSS라 RN 테스트에는 필요 없다.
module.exports = {};
