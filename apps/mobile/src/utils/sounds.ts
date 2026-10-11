import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  /** 핀을 누르는 순간 */
  tap: require('../../assets/sounds/m4a/tap.m4a'),
  /** 초접전 연출 뒤 결과 카드가 드러나는 순간 (claim-result 화면) */
  judgeWin: require('../../assets/sounds/m4a/judge_win.m4a'),
  judgeLose: require('../../assets/sounds/m4a/judge_lose.m4a'),
  /** 간단 알림 모드의 결과 토스트가 뜨는 순간 */
  simpleWin: require('../../assets/sounds/m4a/simple_win.m4a'),
  simpleLose: require('../../assets/sounds/m4a/simple_lose.m4a'),
} as const;

export type SoundName = keyof typeof SOURCES;

// 처음 재생할 때 한 번만 만들어서 앱이 살아있는 동안 재사용한다 (효과음이라 화면보다 오래 살아야 하고, 매번 새로 만들면 지연이 생김).
const players = new Map<SoundName, AudioPlayer>();

/** 효과음 재생 — 연속으로 눌러도 매번 처음부터 다시 재생한다. 소리 실패가 게임 흐름을 막으면 안 되므로 오류는 삼킨다. */
export function playSound(name: SoundName) {
  try {
    let player = players.get(name);
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      players.set(name, player);
    }
    player.seekTo(0);
    player.play();
  } catch {
    // 효과음은 부가 기능 — 재생에 실패해도 무시한다.
  }
}
