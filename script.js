"use strict";

const anthemStylesheet = document.createElement("link");
anthemStylesheet.rel = "stylesheet";
anthemStylesheet.href = "anthem.css";
document.head.append(anthemStylesheet);

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
    name: "久保田 善治",
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
const restartButton = document.querySelector("#restart-button");

function createOpeningAnthem() {
  const hero = document.querySelector(".hero");
  const title = document.querySelector("#page-title");

  if (!hero || !title) {
    return null;
  }

  const section = document.createElement("section");
  section.className = "opening-anthem";
  section.setAttribute("aria-labelledby", "opening-anthem-title");

  const copy = document.createElement("div");
  copy.className = "opening-anthem-copy";

  const kicker = document.createElement("p");
  kicker.className = "opening-anthem-kicker";
  kicker.textContent = "OPENING ANTHEM / KEISUKE 2026";

  const heading = document.createElement("h2");
  heading.id = "opening-anthem-title";
  heading.textContent = "ケイスケをたたえる歌";

  const description = document.createElement("p");
  description.className = "opening-anthem-description";
  description.textContent = "お祝い動画の前に、まずはこちらをお聴きください。";

  copy.append(kicker, heading, description);

  const player = document.createElement("div");
  player.className = "opening-anthem-player";

  const audio = document.createElement("audio");
  audio.id = "keisuke-anthem";
  audio.controls = true;
  audio.preload = "metadata";
  audio.src = "Keisuke.mp3";
  audio.volume = 0.8;
  audio.setAttribute("aria-label", "ケイスケをたたえる歌");

  const status = document.createElement("p");
  status.className = "opening-anthem-status";
  status.setAttribute("aria-live", "polite");
  status.textContent = "再生ボタンを押すと、ケイスケ讃歌が流れます。";

  audio.addEventListener("play", () => {
    status.textContent = "ケイスケ讃歌を再生中";
    document.querySelectorAll(".message-video").forEach((video) => video.pause());
  });

  audio.addEventListener("pause", () => {
    if (!audio.ended && audio.currentTime > 0) {
      status.textContent = "ケイスケ讃歌を一時停止中";
    }
  });

  audio.addEventListener("ended", () => {
    status.textContent = "ケイスケ讃歌の再生が終了しました。";
  });

  audio.addEventListener("error", () => {
    status.textContent = "音源を読み込めませんでした。ページを再読み込みしてください。";
  });

  player.append(audio, status);
  section.append(copy, player);
  title.insertAdjacentElement("afterend", section);

  return audio;
}

const anthemAudio = createOpeningAnthem();
document.querySelector("#music-button")?.remove();

const watched = new Set();

function updateProgress() {
  progressLabel.textContent = `${watched.size} / ${messages.length} WATCHED`;

  if (watched.size === messages.length) {
    showFinale();
  }
}

function showFinale() {
  if (!finale.hidden) {
    return;
  }

  finale.hidden = false;

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
    document.querySelectorAll(".message-video").forEach((otherVideo) => {
      if (otherVideo !== video) otherVideo.pause();
    });

    anthemAudio?.pause();
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

restartButton.addEventListener("click", () => {
  anthemAudio?.pause();
  if (anthemAudio) anthemAudio.currentTime = 0;
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
  anthemAudio?.pause();
});

updateProgress();
