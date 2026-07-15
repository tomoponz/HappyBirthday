"use strict";

// 既存のサイト本体を読み込み、入場曲だけを追加します。
(() => {
  const startButton = document.querySelector("#start-button");

  if (startButton) {
    startButton.disabled = true;
  }

  const coreScript = document.createElement("script");
  coreScript.src = "script-core.js";
  coreScript.async = false;

  coreScript.addEventListener("load", () => {
    const entranceMusic = new Audio("Keisuke.mp3");
    const messageVideo = document.querySelector("#message-video");
    const showSenderButton = document.querySelector("#show-sender-button");
    const restartButtons = document.querySelectorAll(".restart-button");
    const defaultVolume = 0.8;
    let fadeFrame = null;

    entranceMusic.preload = "auto";
    entranceMusic.volume = defaultVolume;

    function stopEntranceMusic(resetPosition = true) {
      if (fadeFrame !== null) {
        window.cancelAnimationFrame(fadeFrame);
        fadeFrame = null;
      }

      entranceMusic.pause();
      entranceMusic.volume = defaultVolume;

      if (resetPosition) {
        entranceMusic.currentTime = 0;
      }
    }

    function playEntranceMusic() {
      stopEntranceMusic(true);
      entranceMusic.play().catch(() => {
        // ブラウザ側で音声再生が拒否されても、サイト本体はそのまま進めます。
      });
    }

    function fadeOutEntranceMusic(duration = 700) {
      if (entranceMusic.paused) {
        return;
      }

      if (fadeFrame !== null) {
        window.cancelAnimationFrame(fadeFrame);
      }

      const startedAt = performance.now();
      const startingVolume = entranceMusic.volume;

      function step(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        entranceMusic.volume = startingVolume * (1 - progress);

        if (progress < 1) {
          fadeFrame = window.requestAnimationFrame(step);
          return;
        }

        fadeFrame = null;
        stopEntranceMusic(true);
      }

      fadeFrame = window.requestAnimationFrame(step);
    }

    // 音声付き自動再生は制限されるため、開始ボタンの操作を再生契機にします。
    startButton?.addEventListener("click", playEntranceMusic, { capture: true });

    // 最初の祝辞動画と音が重ならないよう、動画開始時に入場曲をフェードアウトします。
    messageVideo?.addEventListener("play", () => fadeOutEntranceMusic());
    showSenderButton?.addEventListener("click", () => fadeOutEntranceMusic());

    restartButtons.forEach((button) => {
      button.addEventListener("click", () => stopEntranceMusic(true));
    });

    window.addEventListener("pagehide", () => stopEntranceMusic(false));

    if (startButton) {
      startButton.disabled = false;
    }
  });

  coreScript.addEventListener("error", () => {
    console.error("サイト本体の読み込みに失敗しました。");
    if (startButton) {
      startButton.disabled = false;
    }
  });

  document.head.append(coreScript);
})();
