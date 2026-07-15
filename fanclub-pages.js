"use strict";

const faithStylesheet = document.createElement("link");
faithStylesheet.rel = "stylesheet";
faithStylesheet.href = "keisuke-faith.css";
document.head.append(faithStylesheet);

const memberDialogs = document.querySelectorAll(".member-dialog");
const currentDateLabels = document.querySelectorAll("[data-current-date]");

const japanDate = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "long",
  day: "numeric",
  weekday: "short"
}).format(new Date());

currentDateLabels.forEach((label) => {
  label.textContent = japanDate;
});

const keisukeLegends = [
  "万有引力とは、宇宙がケイスケから離れたくないという気持ちの物理的表現である。",
  "稲は本来直立する植物だったが、ケイスケに頭を下げるために穂を垂れるようになった。",
  "光の速度が有限なのは、ケイスケより先に未来へ到着しないためである。",
  "ケイスケが幼い頃に描いた丸を、家族はただの落書きだと思っていた。数年後、その形と完全に一致する惑星の軌道が、遠く離れた銀河で発見された。",
  "ケイスケが米を一粒落とした。翌年、その土地は記録的な豊作になった。",
  "ケイスケの細胞を顕微鏡で観察した研究者は、逆に細胞から観察されていた。",
  "ケイスケは一度だけ遅刻したことがある。その日から、時計の方が五分早く進むようになった。",
  "ケイスケがくしゃみをすると、気象庁は念のため記者会見の準備を始める。",
  "ケイスケの誕生日を忘れた者はいない。忘れた者の記録が、歴史から消えているだけである。"
];

function createLegendsSection() {
  const section = document.createElement("section");
  section.id = "keisuke-legends-feature";
  section.className = "interstitial faith-legends legends-feature";
  section.setAttribute("aria-labelledby", "legends-feature-title");

  const kicker = document.createElement("p");
  kicker.textContent = "SACRED RECORDS / KEISUKE FAITH";

  const title = document.createElement("h3");
  title.id = "legends-feature-title";
  title.textContent = "聖典・ケイスケ伝説";

  const list = document.createElement("ol");

  keisukeLegends.forEach((legend, index) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    const text = document.createElement("p");

    number.textContent = String(index + 1).padStart(2, "0");
    text.textContent = legend;
    item.append(number, text);
    list.append(item);
  });

  section.append(kicker, title, list);
  return section;
}

const faithDialog = document.querySelector("#keisuke-faith-dialog");
faithDialog?.querySelector(".faith-facts")?.remove();
faithDialog?.querySelector(".faith-doctrine")?.remove();
faithDialog?.querySelector(".faith-legends")?.remove();

const douseiButton = document.querySelector('[data-dialog-target="keisuke-dousei-dialog"]');
if (douseiButton) {
  const label = douseiButton.querySelector("span");
  const title = douseiButton.querySelector("strong");
  if (label) label.textContent = "MEMBERS ONLY ARTICLE";
  if (title) title.textContent = "【会員限定】ケイスケ動静";
}

const douseiSheet = document.querySelector("#keisuke-dousei-dialog .dousei-sheet");
if (douseiSheet && !douseiSheet.querySelector(".dousei-members-only")) {
  const badge = document.createElement("div");
  badge.className = "store-status dousei-members-only";
  badge.textContent = "ファンクラブ会員限定";
  douseiSheet.querySelector(".member-dialog-header")?.insertAdjacentElement("afterend", badge);
}

const fanclubAd = document.querySelector(".fanclub-ad");
if (fanclubAd && !document.querySelector("#keisuke-legends-feature")) {
  fanclubAd.insertAdjacentElement("afterend", createLegendsSection());
}

function openMemberDialog(dialog) {
  if (!dialog) {
    return;
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeMemberDialog(dialog) {
  if (!dialog) {
    return;
  }

  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

document.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-dialog-target]");
  if (opener) {
    const targetId = opener.dataset.dialogTarget;
    openMemberDialog(document.getElementById(targetId));
    return;
  }

  const closer = event.target.closest("[data-dialog-close]");
  if (closer) {
    closeMemberDialog(closer.closest("dialog"));
  }
});

memberDialogs.forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeMemberDialog(dialog);
    }
  });
});