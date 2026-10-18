let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" }
];

const categories = ["personal", "work", "study"];

function searchNotes(word) {
  const searchTerm = String(word).toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  return notes.reduce((longest, note) =>
    note.text.length > longest.text.length ? note : longest
  );
}

function countByCategory() {
  return notes.reduce((counts, note) => {
    counts[note.category] = (counts[note.category] || 0) + 1;
    return counts;
  }, { personal: 0, work: 0, study: 0 });
}

function getSummary() {
  const counts = countByCategory();
  const categorySummary = categories
    .map((category) => `${counts[category] || 0} ${category}`)
    .join(", ");

  return `${notes.length} notes: ${categorySummary}.`;
}

function normalizeText(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function isDuplicate(text) {
  const normalizedText = normalizeText(text);
  return notes.some((note) => normalizeText(note.text) === normalizedText);
}

function addNote(text, category) {
  if (typeof text !== "string" || text.trim().length < 1 || text.length > 200) {
    console.log("Note was not added: text must be 1–200 characters.");
    return false;
  }

  if (!categories.includes(category)) {
    console.log("Note was not added: category must be personal, work, or study.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Note was not added: a note with that text already exists.");
    return false;
  }

  const nextId = notes.reduce((highestId, note) => Math.max(highestId, note.id), 0) + 1;
  notes.push({ id: nextId, text: text.trim(), category });
  console.log("Note added.");
  return true;
}

console.log("Search for 'DAY':", searchNotes("DAY"));
console.log("Longest note:", longestNote());
console.log("Notes by category:", countByCategory());
console.log("Summary:", getSummary());
console.log("Is '  BUY   MILK AND BREAD ' a duplicate:", isDuplicate("  BUY   MILK AND BREAD "));
console.log("Add a new note:", addNote("Pick up a parcel", "personal"));
console.log("Reject a duplicate:", addNote(" PICK UP   A PARCEL ", "work"));
console.log("Reject an empty note:", addNote("   ", "study"));
console.log("Reject an invalid category:", addNote("Plan the weekend", "travel"));
