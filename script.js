"use strict";

// 友人の名前は、この定数だけを変更してください。
const birthdayPerson = "ケイスケ";

// 動画・表示名・メッセージカードの内容を再生順に一元管理します。
// video が存在しないものは、自動的に「映像を準備中です」の表示になります。
const messages = [
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
    video: "videos/07_business.mp4",
    title: "MESSAGE 07",
    sender: "祝賀業務ご担当の方",
    theme: "業務としての祝福",
    comment: "受付番号 BD-4721 にて承りました"
  },
  {
    video: "videos/08_cult.mp4",
    title: "MESSAGE 08",
    sender: "新生祝賀委員会のみなさん",
    theme: "盛大な祝賀",
    comment: "今年の認定、おめでとうございます"
  },
  {
    video: "videos/09_wrong_name.mp4",
    title: "MESSAGE 09",
    sender: "お名前を確認中の方",
    theme: "心を込めたお祝い",
    comment: "お名前の最終確認は、間に合わなかったそうです"
  },
  {
    video: "videos/10_knows_too_much.mp4",
    title: "MESSAGE 10",
    sender: "匿名希望の方",
    theme: "いつも見守っています",
    comment: "日頃のがんばりも、ちゃんと届いているそうです"
  }
];

// 各メッセージ完了時点でのお祝い人数です。
const peopleCounts = [1, 2, 3, 4, 5, 6, 7, 13, 14, 27];

const screens = Array.from(document.querySelectorAll("[data-screen]"));
const startButton = document.querySelector("#start-button");
const connectionMessage = document.querySelector("#connection-message");
const messageTitle = document.querySelector("#message-title");
const messageCounter = document.querySelector("#message-counter");
const messageVideo = document.querySelector("#message-video");
const videoPlaceholder = document.querySelector("#video-placeholder");
const placeholderTitle = document.querySelector("#placeholder-title");
const showSenderButton = document.querySelector("#show-sender-button");
const playbackGuidance = document.querySelector("#playback-guidance");
const senderCheck = document.querySelector("#sender-check");
const senderCard = document.querySelector("#sender-card");
const senderCardTitle = document.querySelector("#sender-card-title");
const senderName = document.querySelector("#sender-name");
const senderTheme = document.querySelector("#sender-relation");
const senderComment = document.querySelector("#sender-status");
const nextButton = document.querySelector("#next-button");
const watchedCount = document.querySelector("#watched-count");
const peopleCount = document.querySelector("#people-count");
const transitionCopy = document.querySelector("#transition-copy");
const resultsTitle = document.querySelector("#results-title");
const resultDetails = document.querySelector("#result-details");
const resultWait = document.querySelector("#result-wait");
const searchFriendButton = document.querySelector("#search-friend-button");
const searchMessage = document.querySelector("#search-message");
const finalVideo = document.querySelector("#final-video");
const finalTitle = document.querySelector("#final-title");
const finalVideoLoading = document.querySelector("#final-video-loading");
const finalPlaybackGuidance = document.querySelector("#final-playback-guidance");
const finalFallback = document.querySelector("#final-fallback");
const birthdayEnding = document.querySelector("#birthday-ending");
const restartButtons = Array.from(document.querySelectorAll(".restart-button"));

// 画面遷移に必要な状態だけを保持します。
const state = {
  screen: "opening",
  currentIndex: 0,
  completedCount: 0,
  messageResolved: false,
  actionLocked: false,
  generation: 0,
  timers: new Map()
};

// 指定時間後に解決し、リセット時に破棄できるタイマーを作ります。
function delay(milliseconds) {
  return new Promise((resolve) => {
    const timerId = window.setTimeout(() => {
      state.timers.delete(timerId);
      resolve();
    }, milliseconds);
    state.timers.set(timerId, resolve);
  });
}

// 実行中のタイマーを破棄し、待機中Promiseも解決して古い処理を終了させます。
function clearTimers() {
  state.timers.forEach((resolve, timerId) => {
    window.clearTimeout(timerId);
    resolve();
  });
  state.timers.clear();
}

// 非表示画面を切り替え、現在画面を状態として記録します。
function showScreen(screenName) {
  screens.forEach((screen) => {
    const shouldShow = screen.dataset.screen === screenName;
    screen.hidden = !shouldShow;
    screen.classList.toggle("fade-in", shouldShow);
  });
  state.screen = screenName;
  window.scrollTo(0, 0);
}

// 画面切り替え後、キーボード操作と読み上げの起点を新しい内容へ移します。
function focusWithoutScrolling(element) {
  if (!element) {
    return;
  }

  try {
    element.focus({ preventScroll: true });
  } catch (_error) {
    element.focus();
  }
}

// 連打による重複遷移を防いで非同期処理を実行します。
async function runExclusive(button, task) {
  if (state.actionLocked) {
    return;
  }

  state.actionLocked = true;
  if (button) {
    button.disabled = true;
  }

  try {
    await task();
  } finally {
    state.actionLocked = false;
    if (button) {
      button.disabled = false;
    }
  }
}

// 画面上の名前を birthdayPerson の値で統一します。
function renderBirthdayPerson() {
  document.querySelectorAll("[data-birthday-person]").forEach((element) => {
    element.textContent = birthdayPerson;
  });
}

// 再生済み件数とお祝い人数を現在状態から描画します。
function updateProgress() {
  watchedCount.textContent = `${state.completedCount} / ${messages.length}`;
  const count = state.completedCount > 0 ? peopleCounts[state.completedCount - 1] : 0;
  peopleCount.textContent = `${count}人`;
}

// 動画を停止し、読み込み元を安全に取り除きます。
function resetVideoElement(video) {
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.hidden = true;
}

// 遅れて届いた動画イベントが、別の動画の画面を書き換えないよう送信元を確認します。
function isExpectedVideoSource(video, relativePath) {
  const expectedUrl = new URL(relativePath, window.location.href).href;
  return video.src === expectedUrl || video.currentSrc === expectedUrl;
}

// 開始後の3段階の準備メッセージを順番に表示します。
async function startExperience() {
  const generation = state.generation;
  showScreen("connecting");

  const connectionSteps = [
    "会場の準備をしています……",
    "お祝いメッセージを受け取っています……",
    "10通のメッセージが届きました"
  ];

  for (const step of connectionSteps) {
    connectionMessage.textContent = step;
    await delay(820);
    if (generation !== state.generation) {
      return;
    }
  }

  showMessage(0);
}

// 指定番号のメッセージ画面を初期化し、動画の読み込みを開始します。
function showMessage(index) {
  const message = messages[index];
  if (!message) {
    return;
  }

  state.currentIndex = index;
  state.messageResolved = false;

  messageTitle.textContent = message.title;
  messageCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${messages.length}`;
  messageCounter.setAttribute("aria-label", `${index + 1}件目、全${messages.length}件`);
  placeholderTitle.textContent = message.title;
  senderCard.hidden = true;
  senderCheck.hidden = true;
  videoPlaceholder.hidden = true;
  showSenderButton.hidden = false;
  showSenderButton.disabled = false;
  playbackGuidance.hidden = true;
  messageVideo.dataset.ready = "false";
  nextButton.textContent = "次のメッセージへ";
  updateProgress();
  showScreen("player");

  messageVideo.hidden = false;
  messageVideo.src = message.video;
  messageVideo.load();
  focusWithoutScrolling(messageTitle);
}

// 動画を自動再生し、制限された場合は手動操作の案内を表示します。
function tryToPlay(video, guidanceElement, expectedPath) {
  const playResult = video.play();
  if (playResult && typeof playResult.catch === "function") {
    playResult.catch(() => {
      if (!video.hidden && isExpectedVideoSource(video, expectedPath)) {
        guidanceElement.hidden = false;
      }
    });
  }
}

// 動画欠損時に、エラー画面ではなく指定の仮表示へ切り替えます。
function showVideoPlaceholder() {
  if (state.screen !== "player" || state.messageResolved) {
    return;
  }

  messageVideo.hidden = true;
  playbackGuidance.hidden = true;
  videoPlaceholder.hidden = false;
}

// 動画終了または仮表示ボタンから、メッセージカードを一度だけ表示します。
async function revealSenderInformation() {
  if (state.screen !== "player" || state.messageResolved) {
    return;
  }

  state.messageResolved = true;
  const generation = state.generation;
  const messageIndex = state.currentIndex;

  showSenderButton.hidden = true;
  playbackGuidance.hidden = true;
  senderCard.hidden = true;
  senderCheck.hidden = false;

  await delay(1000);
  if (
    generation !== state.generation ||
    state.screen !== "player" ||
    messageIndex !== state.currentIndex
  ) {
    return;
  }

  const message = messages[messageIndex];
  senderName.textContent = message.sender;
  senderTheme.textContent = message.theme;
  senderComment.textContent = message.comment;
  senderCheck.hidden = true;
  senderCard.hidden = false;
  state.completedCount = Math.max(state.completedCount, messageIndex + 1);
  updateProgress();
  focusWithoutScrolling(senderCardTitle);
}

// 幕間の読み込み文です。お祝いの調子を最後まで崩しません。
function getTransitionLines(nextIndex) {
  if (nextIndex % 2 === 0) {
    return ["次のメッセージをお届けします……"];
  }

  return ["続いてのゲストをご紹介します……"];
}

// メッセージカードから次の動画、または全通お届け画面へ進みます。
async function goToNextMessage() {
  if (state.screen !== "player" || !state.messageResolved) {
    return;
  }

  if (state.currentIndex >= messages.length - 1) {
    await showResults();
    return;
  }

  const generation = state.generation;
  const nextIndex = state.currentIndex + 1;
  resetVideoElement(messageVideo);
  showScreen("transition");

  transitionCopy.replaceChildren();
  getTransitionLines(nextIndex).forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    transitionCopy.append(paragraph);
  });

  await delay(1450);
  if (generation !== state.generation) {
    return;
  }

  showMessage(nextIndex);
}

// 10通完了の表示後、少し間を置いて詳細を開示します。
async function showResults() {
  const generation = state.generation;
  resetVideoElement(messageVideo);
  resultDetails.hidden = true;
  resultWait.hidden = false;
  showScreen("results");
  focusWithoutScrolling(resultsTitle);

  await delay(2200);
  if (generation !== state.generation || state.screen !== "results") {
    return;
  }

  resultWait.hidden = true;
  resultDetails.hidden = false;
}

// 最後のメッセージへ進む前の3段階演出を表示します。
async function searchForFriendMessage() {
  const generation = state.generation;
  showScreen("search");

  const searchSteps = [
    "とっておきのメッセージを準備しています……",
    "心を込めてお届けします……",
    "準備ができました"
  ];

  for (const step of searchSteps) {
    searchMessage.textContent = step;
    await delay(850);
    if (generation !== state.generation) {
      return;
    }
  }

  showFinalVideo();
}

// 最終動画の画面を初期化して videos/11_final.mp4 を読み込みます。
function showFinalVideo() {
  finalFallback.hidden = true;
  birthdayEnding.hidden = true;
  finalPlaybackGuidance.hidden = true;
  finalVideoLoading.hidden = false;
  finalVideo.hidden = false;
  finalVideo.dataset.ready = "false";
  document.querySelector("#final-media-frame").hidden = false;
  showScreen("final");
  finalVideo.src = "videos/11_final.mp4";
  finalVideo.load();
  focusWithoutScrolling(finalTitle);
}

// 最終動画がない場合に指定文面とエンディングを表示します。
function showFinalFallback() {
  if (state.screen !== "final") {
    return;
  }

  finalVideo.hidden = true;
  finalVideoLoading.hidden = true;
  finalPlaybackGuidance.hidden = true;
  document.querySelector("#final-media-frame").hidden = true;
  finalFallback.hidden = false;
  birthdayEnding.hidden = false;
  focusWithoutScrolling(finalFallback);
}

// 最終動画の自然終了後に HAPPY BIRTHDAY と再スタートを表示します。
function showBirthdayEnding() {
  if (state.screen !== "final") {
    return;
  }

  finalPlaybackGuidance.hidden = true;
  finalVideo.hidden = true;
  document.querySelector("#final-media-frame").hidden = true;
  birthdayEnding.hidden = false;
  focusWithoutScrolling(birthdayEnding);
}

// タイマー、動画、進捗を初期化し、二重タップを短時間遮断して最初へ戻します。
function resetExperience() {
  if (state.actionLocked) {
    return;
  }

  state.actionLocked = true;
  state.generation += 1;
  clearTimers();
  resetVideoElement(messageVideo);
  resetVideoElement(finalVideo);

  state.currentIndex = 0;
  state.completedCount = 0;
  state.messageResolved = false;

  connectionMessage.textContent = "会場の準備をしています……";
  searchMessage.textContent = "とっておきのメッセージを準備しています……";
  transitionCopy.replaceChildren();
  senderCard.hidden = true;
  senderCheck.hidden = true;
  videoPlaceholder.hidden = true;
  playbackGuidance.hidden = true;
  resultDetails.hidden = true;
  resultWait.hidden = false;
  finalFallback.hidden = true;
  birthdayEnding.hidden = true;
  finalVideoLoading.hidden = false;
  finalPlaybackGuidance.hidden = true;
  document.querySelector("#final-media-frame").hidden = false;

  [startButton, showSenderButton, nextButton, searchFriendButton, ...restartButtons].forEach((button) => {
    button.disabled = false;
  });
  startButton.disabled = true;

  updateProgress();
  showScreen("opening");
  focusWithoutScrolling(startButton);

  const resetGeneration = state.generation;
  delay(450).then(() => {
    if (state.generation === resetGeneration && state.screen === "opening") {
      state.actionLocked = false;
      startButton.disabled = false;
    }
  });
}

startButton.addEventListener("click", () => {
  runExclusive(startButton, startExperience);
});

showSenderButton.addEventListener("click", () => {
  runExclusive(showSenderButton, revealSenderInformation);
});

nextButton.addEventListener("click", () => {
  runExclusive(nextButton, goToNextMessage);
});

searchFriendButton.addEventListener("click", () => {
  runExclusive(searchFriendButton, searchForFriendMessage);
});

restartButtons.forEach((button) => {
  button.addEventListener("click", resetExperience);
});

function handleMessageVideoReady() {
  const message = messages[state.currentIndex];
  if (
    state.screen !== "player" ||
    !message ||
    !isExpectedVideoSource(messageVideo, message.video) ||
    messageVideo.dataset.ready === "true"
  ) {
    return;
  }

  messageVideo.dataset.ready = "true";
  videoPlaceholder.hidden = true;
  messageVideo.hidden = false;
  tryToPlay(messageVideo, playbackGuidance, message.video);
}

messageVideo.addEventListener("loadedmetadata", handleMessageVideoReady);
messageVideo.addEventListener("loadeddata", handleMessageVideoReady);
messageVideo.addEventListener("canplay", handleMessageVideoReady);

messageVideo.addEventListener("play", () => {
  playbackGuidance.hidden = true;
});

messageVideo.addEventListener("error", () => {
  const message = messages[state.currentIndex];
  if (message && isExpectedVideoSource(messageVideo, message.video)) {
    showVideoPlaceholder();
  }
});

messageVideo.addEventListener("ended", () => {
  const message = messages[state.currentIndex];
  if (message && isExpectedVideoSource(messageVideo, message.video)) {
    runExclusive(null, revealSenderInformation);
  }
});

function handleFinalVideoReady() {
  if (
    state.screen !== "final" ||
    !isExpectedVideoSource(finalVideo, "videos/11_final.mp4") ||
    finalVideo.dataset.ready === "true"
  ) {
    return;
  }

  finalVideo.dataset.ready = "true";
  finalVideoLoading.hidden = true;
  finalVideo.hidden = false;
  tryToPlay(finalVideo, finalPlaybackGuidance, "videos/11_final.mp4");
}

finalVideo.addEventListener("loadedmetadata", handleFinalVideoReady);
finalVideo.addEventListener("loadeddata", handleFinalVideoReady);
finalVideo.addEventListener("canplay", handleFinalVideoReady);

finalVideo.addEventListener("play", () => {
  finalVideoLoading.hidden = true;
  finalPlaybackGuidance.hidden = true;
});

finalVideo.addEventListener("error", () => {
  if (isExpectedVideoSource(finalVideo, "videos/11_final.mp4")) {
    showFinalFallback();
  }
});

finalVideo.addEventListener("ended", () => {
  if (isExpectedVideoSource(finalVideo, "videos/11_final.mp4")) {
    showBirthdayEnding();
  }
});

renderBirthdayPerson();
updateProgress();

/* ===================== 入場BGM ===================== */
// 開始ボタンの操作を契機に Keisuke.mp3 を再生し、最初の動画が
// 始まったら（または動画なしでカードを開いたら）フェードアウトします。

const entranceMusic = new Audio("Keisuke.mp3");
const musicDefaultVolume = 0.8;
let musicFadeFrame = null;

entranceMusic.preload = "auto";
entranceMusic.volume = musicDefaultVolume;

function stopEntranceMusic(resetPosition = true) {
  if (musicFadeFrame !== null) {
    window.cancelAnimationFrame(musicFadeFrame);
    musicFadeFrame = null;
  }

  entranceMusic.pause();
  entranceMusic.volume = musicDefaultVolume;

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

  if (musicFadeFrame !== null) {
    window.cancelAnimationFrame(musicFadeFrame);
  }

  const startedAt = performance.now();
  const startingVolume = entranceMusic.volume;

  function step(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    entranceMusic.volume = startingVolume * (1 - progress);

    if (progress < 1) {
      musicFadeFrame = window.requestAnimationFrame(step);
      return;
    }

    musicFadeFrame = null;
    stopEntranceMusic(true);
  }

  musicFadeFrame = window.requestAnimationFrame(step);
}

// 音声付き自動再生は制限されるため、開始ボタンの操作を再生契機にします。
startButton.addEventListener("click", playEntranceMusic, { capture: true });

// 最初の動画と音が重ならないよう、動画開始時に入場曲をフェードアウトします。
messageVideo.addEventListener("play", () => fadeOutEntranceMusic());
showSenderButton.addEventListener("click", () => fadeOutEntranceMusic());

restartButtons.forEach((button) => {
  button.addEventListener("click", () => stopEntranceMusic(true));
});

window.addEventListener("pagehide", () => stopEntranceMusic(false));
