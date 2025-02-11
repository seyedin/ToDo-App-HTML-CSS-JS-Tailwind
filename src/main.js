// ------------------------------ Initialization ----------

// Data Persistence using Local Storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Simulate a simple user database
let users = JSON.parse(localStorage.getItem("users")) || [];

// ------------------------------ DOM Elements ----------

// Authentication Elements
const signupForm = document.getElementById("signupForm");
const loginFormElement = document.getElementById("loginForm");
const appContent = document.getElementById("appContent");

const signup = document.getElementById("signup");
const login = document.getElementById("login");

const showSignupLink = document.getElementById("showSignup");
const showLoginLink = document.getElementById("showLogin");

const logoutBtn = document.getElementById("logout");

// Task Elements
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const deleteAllTasksBtn = document.getElementById("deleteAllTasks");
const filterSelect = document.getElementById("filter");

// Message Display
const message = document.getElementById("message");

// User List Element
const userList = document.getElementById("userList");

// Custom Modal Elements for Deletion Confirmation
const confirmModal = document.getElementById("confirmModal");
const cancelButton = document.getElementById("cancelButton");
const confirmButton = document.getElementById("confirmButton");

// ------------------------------ Event Listeners ----------

// Toggle between signup and login forms
showSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginFormElement.classList.add("hidden");
  signupForm.classList.remove("hidden");
});

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.classList.add("hidden");
  loginFormElement.classList.remove("hidden");
});

// User Signup with Validation
signup.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (username && password) {
    // Check if user already exists
    if (users.some((user) => user.username === username)) {
      showMessage(
        "Username already exists. Please choose another one.",
        "error"
      );
    } else {
      // Save user (Note: For educational purposes only; not secure)
      users.push({ username, password });
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", username);
      localStorage.setItem("isAuthenticated", true);

      showMessage("Account created successfully!");
      checkAuthentication();
    }
  } else {
    showMessage("Please fill in all required fields.", "error");
  }
});

// Requirement 1 & 9: User Login with Validation
login.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    localStorage.setItem("currentUser", username);
    localStorage.setItem("isAuthenticated", true);
    showMessage("Login successful!");
    checkAuthentication();
  } else {
    showMessage("Invalid username or password.", "error");
  }
});

// User Logout
logoutBtn.addEventListener("click", () => {
  localStorage.setItem("isAuthenticated", false);
  localStorage.removeItem("currentUser");
  checkAuthentication();
  showMessage("You have been logged out.");
});

// Function to check user authentication status
function checkAuthentication() {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (isAuthenticated === "true") {
    loginFormElement.classList.add("hidden");
    signupForm.classList.add("hidden");
    appContent.classList.remove("hidden");
    renderTasks();
    fetchUsers();
  } else {
    appContent.classList.add("hidden");
    signupForm.classList.add("hidden");
    loginFormElement.classList.remove("hidden");
  }
}

// ------------------------------ ToDo Application Functions ----------

// Add New Task with Validation
taskForm.addEventListener("submit", addTask);

function addTask(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("dueDate").value;

  // Form Validation
  if (title === "" || dueDate === "") {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  const currentUser = localStorage.getItem("currentUser");

  const newTask = {
    id: Date.now(),
    user: currentUser,
    title,
    description,
    dueDate,
    completed: false,
  };

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskForm.reset();
  renderTasks();
  showMessage("Task added successfully!");
}

// Render Tasks with Filter and Sorting
filterSelect.addEventListener("change", renderTasks);

function renderTasks() {
  taskList.innerHTML = "";

  const currentUser = localStorage.getItem("currentUser");

  let userTasks = tasks.filter((task) => task.user === currentUser);

  let filteredTasks = userTasks;
  const filterValue = filterSelect.value;

  if (filterValue === "completed") {
    filteredTasks = userTasks.filter((task) => task.completed);
  } else if (filterValue === "pending") {
    filteredTasks = userTasks.filter((task) => !task.completed);
  }

  // Sort tasks by due date
  filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  filteredTasks.forEach((task) => {
    // Create task list item
    const li = document.createElement("li");
    li.className =
      "p-4 bg-white rounded shadow flex items-center justify-between";

    // Task info
    const taskInfo = document.createElement("div");
    taskInfo.innerHTML = `
      <h3 class="font-bold text-lg ${
        task.completed ? "line-through text-gray-400" : ""
      }">${task.title}</h3>
      <p class="text-sm ${
        task.completed ? "line-through text-gray-400" : ""
      }">${task.description}</p>
      <p class="text-sm text-gray-600">Due: ${task.dueDate}</p>
    `;

    // Task actions
    const taskActions = document.createElement("div");
    taskActions.className = "flex items-center space-x-2";

    // Mark Task as Completed
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.completed ? "Undo" : "Complete";
    toggleBtn.className = `px-2 py-1 text-white rounded ${
      task.completed ? "bg-yellow-500" : "bg-green-500"
    }`;
    toggleBtn.addEventListener("click", () => toggleTask(task.id));

    // Edit Task
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "px-2 py-1 bg-blue-500 text-white rounded";
    editBtn.addEventListener("click", () => editTask(task.id));

    // Delete Task
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "px-2 py-1 bg-red-500 text-white rounded";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskActions.appendChild(toggleBtn);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    li.appendChild(taskInfo);
    li.appendChild(taskActions);

    taskList.appendChild(li);
  });
}

// Toggle Task Completion Status
function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      task.completed = !task.completed;
    }
    return task;
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  showMessage("Task status updated!");
}

// Edit Task
function editTask(id) {
  const taskToEdit = tasks.find((task) => task.id === id);

  document.getElementById("title").value = taskToEdit.title;
  document.getElementById("description").value = taskToEdit.description;
  document.getElementById("dueDate").value = taskToEdit.dueDate;

  // Remove the old task
  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  showMessage("Edit the task and save changes.");
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  showMessage("Task deleted!");
}

// ------------------------------ Delete All Tasks with Custom Modal ----------

// Remove previous event listener
deleteAllTasksBtn.removeEventListener("click", deleteAllTasks);

// Add event listener to show custom modal
deleteAllTasksBtn.addEventListener("click", showModal);

// Show the confirmation modal
function showModal() {
  confirmModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

// Hide the confirmation modal
function hideModal() {
  confirmModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

// Handle Cancel button click
cancelButton.addEventListener("click", hideModal);

// Handle Confirm button click
confirmButton.addEventListener("click", () => {
  const currentUser = localStorage.getItem("currentUser");
  tasks = tasks.filter((task) => task.user !== currentUser);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  showMessage("All tasks have been deleted!");
  hideModal();
});

// Close modal when clicking outside of it
confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    hideModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !confirmModal.classList.contains("hidden")) {
    hideModal();
  }
});

// ------------------------------ Message Display Function ----------

// Show Messages to User
function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `mt-4 text-center ${
    type === "success" ? "text-green-500" : "text-red-500"
  }`;
  setTimeout(() => {
    message.textContent = "";
  }, 5000);
}

// ------------------------------ Fetch and Display Users ----------

// Fetch Data for 10 Users and Display in DOM
async function fetchUsers() {
  try {
    const response = await fetch("https://dummyjson.com/users");
    const data = await response.json();
    const usersData = data.users.slice(0, 10); // Get first 10 users

    userList.innerHTML = "";

    usersData.forEach((user) => {
      const userCard = document.createElement("div");
      userCard.className = "bg-white p-4 rounded shadow";

      userCard.innerHTML = `
        <h3 class="font-bold text-lg">${user.firstName} ${user.lastName}</h3>
        <p class="text-sm">Email: ${user.email}</p>
        <p class="text-sm">Age: ${user.age}</p>
      `;

      userList.appendChild(userCard);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// ------------------------------ Initial Authentication Check ----------

checkAuthentication();

// Requirement 15: Send Project via Postman
// For testing APIs with Postman, you can send requests to 'https://dummyjson.com/users' to fetch users.
