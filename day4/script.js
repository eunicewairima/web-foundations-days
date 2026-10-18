const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearButton = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

const draftKey = "quicknotes-day4-draft";
const themeKey = "quicknotes-day4-theme";

function updateCounts() {
  const text = noteText.value;
  const characters = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  charCount.textContent = `${characters} / 200 characters`;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;

  charCount.classList.toggle("warning", characters > 180);
  charCount.classList.toggle("over", characters > 200);
}

function clearNote() {
  noteText.value = "";
  localStorage.removeItem(draftKey);
  updateCounts();
}

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem(draftKey, noteText.value);
});

clearButton.addEventListener("click", clearNote);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(themeKey, isDark ? "dark" : "light");
  updateThemeButton();
});

const savedDraft = localStorage.getItem(draftKey);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}

if (localStorage.getItem(themeKey) === "dark") {
  document.body.classList.add("dark");
}

updateThemeButton();
updateCounts();
