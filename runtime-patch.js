"use strict";

// 実在する7本だけに再生リストを整理します。
messages.splice(0, messages.length,
  {
    video: "さくらさん_8秒まで_0.9倍速.mp4",
    title: "MESSAGE 01",
    sender: "さくらさん",
    theme: "はじめましての祝福",
    comment: "とびきりの笑顔でお祝いを届けてくれました"
  },
  {
    video: "コメ農家の野口さん.mp4",
    title: "MESSAGE 02",
    sender: "コメ農家の野口さん",
    theme: "実りへの願い",
    comment: "「お米を食べて元気になれよー」"
  },
  {
    video: "ライバル.mp4",
    title: "MESSAGE 03",
    sender: "永遠のライバルを名乗る方",
    theme: "宿命の再会",
    comment: "次に会う日を楽しみにしているそうです"
  },
  {
    video: "脅迫.mp4",
    title: "MESSAGE 04",
    sender: "緊張気味のご様子の方",
    theme: "心からのお祝い（ご本人談）",
    comment: "言葉をひとつずつ、慎重に選んでくれました"
  },
  {
    video: "未来から.mp4",
    title: "MESSAGE 05",
    sender: "未来から来たという方",
    theme: "27年後からの祝辞",
    comment: "未来のことは、まだ内緒だそうです"
  },
  {
    video: "893.mp4",
    title: "MESSAGE 06",
    sender: "義理と人情に厚い方",
    theme: "漢気の祝福",
    comment: "今後とも変わらぬお付き合いを、とのことです"
  },
  {
    video: "気にしなくていい.mp4",
    title: "MESSAGE 07",
    sender: "気にしなくていいと言ってくれる方",
    theme: "肩の力を抜いて",
    comment: "細かいことは気にせず、楽しい一年を過ごしてほしいそうです"
  }
);
peopleCounts.splice(0, peopleCounts.length, 1, 2, 3, 4, 5, 6, 7);

// 準備画面の件数も、実在する動画数へ合わせます。
startExperience = async function patchedStartExperience() {
  const generation = state.generation;
  showScreen("connecting");

  const connectionSteps = [
    "会場の準備をしています……",
    "お祝いメッセージを受け取っています……",
    `${messages.length}通のメッセージが届きました`
  ];

  for (const step of connectionSteps) {
    connectionMessage.textContent = step;
    await delay(820);
    if (generation !== state.generation) return;
  }

  showMessage(0);
};

document.querySelectorAll('[data-screen="search"], [data-screen="final"]').forEach((screen) => screen.remove());
document.querySelector("#search-friend-button")?.remove();

const mediaFrame = document.querySelector("#message-media-frame");

function clearVideoOrientation() {
  mediaFrame.classList.remove("is-portrait", "is-landscape", "is-placeholder");
}

function setVideoOrientation() {
  clearVideoOrientation();
  mediaFrame.classList.add(messageVideo.videoHeight > messageVideo.videoWidth ? "is-portrait" : "is-landscape");
}

messageVideo.addEventListener("loadedmetadata", setVideoOrientation);
messageVideo.addEventListener("error", () => {
  clearVideoOrientation();
  mediaFrame.classList.add("is-placeholder");
});

const originalShowMessage = showMessage;
showMessage = function patchedShowMessage(index) {
  clearVideoOrientation();
  originalShowMessage(index);
  nextButton.textContent = index === messages.length - 1 ? "お祝いページへ" : "次のメッセージへ";
};

function playCompletionMusic() {
  stopEntranceMusic(true);
  entranceMusic.loop = true;
  entranceMusic.volume = 0.8;
  entranceMusic.play().catch(() => {
    // 端末設定で音声再生が拒否されても、終了画面は表示します。
  });
}

showResults = async function patchedShowResults() {
  const generation = state.generation;
  resetVideoElement(messageVideo);
  clearVideoOrientation();
  resultDetails.hidden = true;
  resultWait.hidden = false;
  resultsTitle.innerHTML = `${messages.length}通のメッセージを<br>すべて見終わりました`;
  document.body.classList.add("all-messages-complete");
  showScreen("results");
  playCompletionMusic();
  focusWithoutScrolling(resultsTitle);

  await delay(1200);
  if (generation !== state.generation || state.screen !== "results") return;

  resultWait.hidden = true;
  resultDetails.hidden = false;
};

const originalResetExperience = resetExperience;
resetExperience = function patchedResetExperience() {
  entranceMusic.loop = false;
  document.body.classList.remove("all-messages-complete");
  clearVideoOrientation();
  originalResetExperience();
};

startButton.addEventListener("click", () => {
  entranceMusic.loop = false;
}, { capture: true });

restartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    entranceMusic.loop = false;
  });
});

const openingCount = document.querySelector(".edition-card > div:first-child dd");
if (openingCount) openingCount.textContent = `全${messages.length}通`;

const resultRows = document.querySelectorAll(".result-grid p");
if (resultRows[0]) resultRows[0].querySelector("strong").textContent = `${messages.length}通`;

updateProgress();
