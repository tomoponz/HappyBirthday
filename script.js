"use strict";

const messages = [
  {
    video: "さくらさん_8秒まで_0.9倍速.mp4",
    name: "さくらさん",
    theme: "はじめましての祝福",
    comment: "とびきりの笑顔で、お祝いを届けてくれました。"
  },
  {
    video: "コメ農家の野口さん.mp4",
    name: "コメ農家の野口さん",
    theme: "実りへの願い",
    comment: "お米を食べて元気になれよー、とのことです。"
  },
  {
    video: "ライバル.mp4",
    name: "永遠のライバルを名乗る方",
    theme: "宿命の再会",
    comment: "次に会う日を楽しみにしているそうです。"
  },
  {
    video: "脅迫.mp4",
    name: "緊張気味のご様子の方",
    theme: "心からのお祝い",
    comment: "言葉をひとつずつ、慎重に選んでくれました。"
  },
  {
    video: "未来から.mp4",
    name: "未来から来たという方",
    theme: "27年後からの祝辞",
    comment: "未来のことは、まだ内緒だそうです。"
  },
  {
    video: "893.mp4",
    name: "義理と人情に厚い方",
    theme: "漢気の祝福",
    comment: "今後とも変わらぬお付き合いを、とのことです。"
  },
  {
    video: "気にしなくていい.mp4",
    name: "気にしなくていいと言ってくれる方",
    theme: "肩の力を抜いて",
    comment: "細かいことは気にせず、楽しい一年を過ごしてほしいそうです。"
  },
  {
    video: "クラブ.mp4",
    name: "夜のお店の皆さん",
    theme: "華やかな祝福",
    comment: "来店歴については、関係者の間でも証言が分かれています。"
  }
];

const messageList = document.querySelector("#message-list");
const template = document.querySelector("#message-template");
const fanclubTemplate = document.querySelector("#fanclub-template");
const premiumTemplate = document.querySelector("#premium-template");
const progressLabel = document.querySelector("#progress-label");
const finale = document.querySelector("#finale");
const musicButton = document.querySelector("#music-button");
const restartButton = document.querySelector("#restart-button");

const watched = new Set();
const music = new Audio("Keisuke.mp3");
music.loop = true;
music.preload = "auto";
music.volume = 0.8;

const startSound = new Audio("nc167325_ガシャット挿入音.wav");
startSound.preload = "auto";
startSound.volume = 0.85;
let hasPlayedStartSound = false;

function updateProgress() {
  progressLabel.textContent = `${watched.size} / ${messages.length} WATCHED`;

  if (watched.size === messages.length) {
    showFinale();
  }
}

function playFinaleMusic() {
  music.currentTime = 0;
  const result = music.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      musicButton.hidden = false;
    });
  }
}

function playStartSoundOnce() {
  if (hasPlayedStartSound) {
    return;
  }

  hasPlayedStartSound = true;
  startSound.pause();
  startSound.currentTime = 0;
  const result = startSound.play();

  if (result && typeof result.catch === "function") {
    result.catch(() => {
      // 音声が拒否されても、動画は通常どおり再生します。
    });
  }
}

function showFinale() {
  if (!finale.hidden) {
    return;
  }

  finale.hidden = false;
  playFinaleMusic();

  window.setTimeout(() => {
    finale.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 250);
}

function markWatched(index, item) {
  if (watched.has(index)) {
    return;
  }

  watched.add(index);
  item.classList.add("is-watched");
  item.querySelector(".message-state").textContent = "視聴済み";
  updateProgress();
}

function applyVideoOrientation(video, item) {
  item.classList.toggle("is-portrait", video.videoHeight > video.videoWidth);
}

function appendInterstitial(templateElement) {
  if (!templateElement) {
    return;
  }

  messageList.append(templateElement.content.cloneNode(true));
}

messages.forEach((message, index) => {
  const fragment = template.content.cloneNode(true);
  const item = fragment.querySelector(".message-item");
  const video = fragment.querySelector(".message-video");
  const errorMessage = fragment.querySelector(".video-error");

  item.dataset.index = String(index);
  item.querySelector(".message-number").textContent = String(index + 1).padStart(2, "0");
  item.querySelector(".message-name").textContent = message.name;
  item.querySelector(".message-theme").textContent = message.theme;
  item.querySelector(".message-comment").textContent = message.comment;

  video.src = message.video;
  video.setAttribute("aria-label", `${index + 1}本目、${message.name}のお祝い動画`);

  video.addEventListener("loadedmetadata", () => {
    applyVideoOrientation(video, item);
  });

  video.addEventListener("play", () => {
    playStartSoundOnce();

    document.querySelectorAll(".message-video").forEach((otherVideo) => {
      if (otherVideo !== video) otherVideo.pause();
    });

    if (!music.paused) {
      music.pause();
      musicButton.hidden = false;
    }
  });

  video.addEventListener("ended", () => {
    markWatched(index, item);
  });

  video.addEventListener("error", () => {
    video.hidden = true;
    errorMessage.hidden = false;
  });

  messageList.append(fragment);

  if (index === 2) {
    appendInterstitial(fanclubTemplate);
  }

  if (index === 4) {
    appendInterstitial(premiumTemplate);
  }
});

musicButton.addEventListener("click", () => {
  musicButton.hidden = true;
  playFinaleMusic();
});

restartButton.addEventListener("click", () => {
  music.pause();
  music.currentTime = 0;
  startSound.pause();
  startSound.currentTime = 0;
  hasPlayedStartSound = false;
  musicButton.hidden = true;
  finale.hidden = true;
  watched.clear();

  document.querySelectorAll(".message-item").forEach((item) => {
    item.classList.remove("is-watched");
    item.querySelector(".message-state").textContent = "未視聴";
  });

  document.querySelectorAll(".message-video").forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });

  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("pagehide", () => {
  music.pause();
  startSound.pause();
});

updateProgress();