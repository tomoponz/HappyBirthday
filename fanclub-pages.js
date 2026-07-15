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
