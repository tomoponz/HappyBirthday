"use strict";

// 既存のサイト本体を読み込み、入場曲と明るい誕生日演出を追加します。
(() => {
  const celebrationStylesheet = document.createElement("link");
  celebrationStylesheet.rel = "stylesheet";
  celebrationStylesheet.href = "celebration.css";
  document.head.append(celebrationStylesheet);

  const startButton = document.querySelector("#start-button");

  if (startButton) {
    startButton.disabled = true;
  }

  function applyCelebrationCopy() {
    const orgTitle = document.querySelector(".org-text b");
    const orgSubtitle = document.querySelector(".org-text i");
    const openingEyebrow = document.querySelector(".screen-opening .eyebrow");
    const heroTitle = document.querySelector(".hero-title");
    const lead = document.querySelector(".lead");
    const editionRows = document.querySelectorAll(".edition-card > div");
    const soundNote = document.querySelector(".sound-note");
    const connectionEyebrow = document.querySelector("#screen-connecting .eyebrow");
    const liveBadge = document.querySelector(".live-badge");
    const playerEyebrow = document.querySelector(".title-row .eyebrow");
    const cardKicker = document.querySelector(".card-kicker");
    const senderCardTitle = document.querySelector("#sender-card-title");
    const sealText = document.querySelector(".seal span");
    const cardFootLabel = document.querySelector(".card-foot span:first-child");
    const progressLabels = document.querySelectorAll(".progress-status span");
    const resultsEyebrow = document.querySelector(".results-screen .eyebrow");
    const resultsTitle = document.querySelector("#results-title");
    const resultLabels = document.querySelectorAll(".result-grid span");
    const resultWait = document.querySelector("#result-wait");
    const searchEyebrow = document.querySelector("#screen-search .eyebrow");
    const finalEyebrow = document.querySelector(".final-header .eyebrow");
    const finalTitle = document.querySelector("#final-title");

    if (orgTitle) orgTitle.textContent = "ケイスケ生誕祭 実行委員会";
    if (orgSubtitle) orgSubtitle.textContent = "KEISUKE BIRTHDAY CELEBRATION 2026";
    if (openingEyebrow) openingEyebrow.textContent = "HAPPY BIRTHDAY SPECIAL";
    if (heroTitle) heroTitle.innerHTML = "HAPPY<br>BIRTHDAY";
    if (lead) {
      lead.innerHTML = "今日はケイスケの誕生日！<br>世界中からお祝いメッセージが届いています。";
    }

    const editionCopy = [
      ["お祝い企画", "全10組 ／ 総勢27名"],
      ["本日の主役", "ケイスケ"],
      ["準備状況", "お祝い準備OK"]
    ];

    editionRows.forEach((row, index) => {
      const term = row.querySelector("dt");
      const description = row.querySelector("dd");
      const copy = editionCopy[index];

      if (!copy) return;
      if (term) term.textContent = copy[0];
      if (description) description.textContent = copy[1];
    });

    if (startButton) startButton.textContent = "お祝いをスタート！";
    if (soundNote) soundNote.textContent = "音声をオンにしてお楽しみください 🎉";
    if (connectionEyebrow) connectionEyebrow.textContent = "BIRTHDAY CELEBRATION";
    if (liveBadge) {
      const indicator = liveBadge.querySelector("i");
      liveBadge.replaceChildren();
      if (indicator) liveBadge.append(indicator);
      liveBadge.append("お祝い中");
    }
    if (playerEyebrow) playerEyebrow.textContent = "お祝いメッセージ";
    if (cardKicker) cardKicker.textContent = "SPECIAL GUEST PROFILE";
    if (senderCardTitle) senderCardTitle.textContent = "ゲスト情報";
    if (sealText) sealText.innerHTML = "知り合い<br>ではない";
    if (cardFootLabel) cardFootLabel.textContent = "ケイスケ生誕祭";

    const progressCopy = ["再生済み", "お祝い人数", "知っていた人"];
    progressLabels.forEach((label, index) => {
      if (progressCopy[index]) label.textContent = progressCopy[index];
    });

    if (resultsEyebrow) resultsEyebrow.textContent = "CELEBRATION COMPLETE";
    if (resultsTitle) resultsTitle.innerHTML = "すべてのお祝いを<br>再生しました";

    const resultCopy = ["お祝いしてくれた人", "ケイスケの知人", "名前を正しく知っていた人"];
    resultLabels.forEach((label, index) => {
      if (resultCopy[index]) label.textContent = resultCopy[index];
    });

    if (resultWait) resultWait.textContent = "お祝い結果を集計しています……";
    if (searchEyebrow) searchEyebrow.textContent = "FRIEND MESSAGE SEARCH";
    if (finalEyebrow) finalEyebrow.textContent = "A MESSAGE FROM A FRIEND";
    if (finalTitle) finalTitle.textContent = "FINAL SURPRISE";
  }

  applyCelebrationCopy();

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
