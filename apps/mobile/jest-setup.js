// react-native-reanimated를 쓰는 컴포넌트를 Jest에서 렌더링할 때 필요한 설정.
// (네이티브 워클릿 대신 테스트용 구현으로 바꿔치기한다)
require('react-native-reanimated').setUpTests();

// react-native-gesture-handler(스와이프 등)를 쓰는 컴포넌트를 Jest에서 렌더링할 때 필요한 설정.
require('react-native-gesture-handler/jestSetup');
