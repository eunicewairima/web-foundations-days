const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const status = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

const usersUrl = "https://jsonplaceholder.typicode.com/users";
let users = [];

function renderUsers(list) {
  usersList.replaceChildren();

  list.forEach((user) => {
    const item = document.createElement("li");
    const name = document.createElement("h2");
    const email = document.createElement("p");
    const city = document.createElement("p");
    const company = document.createElement("p");

    name.textContent = user.name;
    email.textContent = `Email: ${user.email}`;
    city.textContent = `City: ${user.address.city}`;
    company.textContent = `Company: ${user.company.name}`;

    item.append(name, email, city, company);
    usersList.append(item);
  });
}

async function loadUsers() {
  loadButton.disabled = true;
  filterInput.disabled = true;
  users = [];
  renderUsers(users);
  status.textContent = "Loading users...";

  try {
    const response = await fetch(usersUrl);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }

    users = await response.json();
    filterInput.disabled = false;
    filterInput.value = "";
    renderUsers(users);
    status.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    status.textContent = `Unable to load users. ${error.message}`;
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  const searchText = filterInput.value.trim().toLowerCase();
  const matchingUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText)
  );

  renderUsers(matchingUsers);
  status.textContent = matchingUsers.length === 0
    ? "No users match your filter."
    : `Showing ${matchingUsers.length} of ${users.length} users.`;
});
