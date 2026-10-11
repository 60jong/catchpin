import { render } from '@testing-library/react-native';

import { MyMarker } from './MyMarker';

const URL = 'https://cdn.example.com/profile/1/a.jpg';

// 렌더 결과(JSON)에 사진 URL이 들어 있는지로, 사진을 그렸는지 본다.
async function renderedTree(element: React.ReactElement) {
  const { toJSON } = await render(element);
  return JSON.stringify(toJSON());
}

describe('<MyMarker />', () => {
  test('프로필 사진 URL이 있으면 그 사진을 그린다', async () => {
    expect(await renderedTree(<MyMarker imageUrl={URL} />)).toContain(URL);
  });

  test('사진이 없으면 사진을 그리지 않는다(기본 실루엣)', async () => {
    expect(await renderedTree(<MyMarker imageUrl={null} />)).not.toContain('cdn.example.com');
  });

  test('위치 권한이 꺼진 상태에서는 사진이 있어도 위치 꺼짐 아이콘을 보여준다', async () => {
    expect(await renderedTree(<MyMarker variant="noLocation" imageUrl={URL} />)).not.toContain(URL);
  });
});
