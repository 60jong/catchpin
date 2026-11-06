/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');

// 색 토큰 자체와, 브랜드 로고·구글 로고(고정 자산), 템플릿 스플래시만 색을 직접 가질 수 있다.
const ALLOWED = [
  'constants/theme.ts',
  'map/skia/mapTheme.ts',
  'map/maplibre/palette.ts',
  'components/brand/Logo.tsx',
  'components/brand/GoogleLogo.tsx',
  'components/animated-icon.tsx',
  'utils/color.ts',
];

function listSources(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listSources(full, out);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('색 하드코딩 금지', () => {
  it('허용된 파일 밖에는 hex·rgba 색이 없다', () => {
    const offenders: string[] = [];
    for (const file of listSources(SRC)) {
      const rel = path.relative(SRC, file);
      if (ALLOWED.includes(rel)) continue;
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // 주석
          if (/['"`]#[0-9A-Fa-f]{3,8}['"`]|rgba?\(/.test(line) && !/withAlpha/.test(line.replace(/rgba\(\$\{/, ''))) offenders.push(`${rel}:${i + 1} ${line.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
