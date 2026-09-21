# JavaScript Practice - Pomofocus Clone

This project is a front-end exercise focused on building a Pomodoro Web Application, heavily inspired by Pomofocus.io. The purpose is to apply foundational concepts of HTML5, CSS3, and JavaScript (ES6), including DOM manipulation, data management, and asynchronous operations.

## Project Overview

- **Design Source**:
  - Pomofocus.io UI reference
- **Tech Stack**:
  - HTML5 & CSS3
  - JavaScript (ES6 syntax)
  - JSON Server (for mocking a full REST API)
  - JSON Server Auth (for JWT Authentication & Bcrypt Password Hashing)
  - localStorage (for saving user data in the browser)
- **Goal**:
  - Apply knowledge of HTML5, CSS3, and modern JavaScript.
  - Practice DOM manipulation and form validation.
  - Understand and apply `localStorage` for data persistence.
  - Handle asynchronous code (mocking API calls).
  - Use Chrome DevTools effectively for debugging issues.

### Related Resources

- **Timeline**: Started July 6th, 2026.
- **Team size**: 1 developer (Lê Bá Long).
- **Editor**: VSCode.

## Features

- **Task Management (CRUD)**: Add, edit, and delete tasks easily.
- **Task Status**: Mark tasks as done (visualized with a red checkbox and a crossed-out line).
- **Clear Data**: A "Delete all" option to quickly clear the task list.
- **Dynamic Aggregation Data**:
  - Automatically calculates total Estimated (Est) Pomodoros.
  - Tracks Actual (Act) Pomodoros completed.
  - Dynamically calculates the "Finish At" time based on current time and remaining Pomodoros.
- **Security**: Secure authentication flow using JWT (JSON Web Tokens) and automatic Bearer token injection.

## Folder Structure

```
📁 practices-pomofocus/
├── 📁 .vscode/              # VS Code editor configurations
├── 📁 icons/                # Folder containing all image assets and SVG icons
├── 📁 js/                   # Core JavaScript Logic & Architecture
│   ├── 📁 api/              # Network & Data Layer
│   │   ├── apiClient.js     # API Interceptor: Automatically injects JWT Bearer tokens
│   │   ├── localDB.js       # Fallback localStorage database operations
│   │   └── storage.js       # Handles API requests (fetch, create, update, remove tasks)
│   ├── 📁 config/           # Configuration Layer
│   │   └── config.js        # Environment variables (e.g., API BASE_URL)
│   ├── 📁 logic/            # Business Logic Layer (No DOM manipulation)
│   │   ├── authLogic.js     # User authentication, JWT validation, and login state
│   │   ├── taskLogic.js     # Manages task arrays and Pomodoro calculations
│   │   └── timerLogic.js    # Handles countdown intervals and time math
│   ├── 📁 ui/               # Presentation Layer (DOM manipulation)
│   │   ├── dom.js           # Centralized DOM elements selection dictionary
│   │   ├── uiButtonState.js # Handles dynamic button states (active/disabled)
│   │   ├── uiHeader.js      # Handles Avatar/Sign In toggles and dropdowns
│   │   ├── uiLoader.js      # Controls loading spinners and transitions
│   │   ├── uiTasks.js       # Handles task forms, editing, and list rendering
│   │   ├── uiTimer.js       # Handles Timer buttons and mode switching
│   │   └── uiToast.js       # Displays toast notifications
│   ├── 📁 utils/            # Utilities Layer
│   │   ├── errorHandler.js  # Centralized error handling logic
│   │   └── timeUtils.js     # Helper functions (e.g., finish time string formatting)
│   ├── login.js             # Entry point for the login page events
│   └── main.js              # Main Entry Point orchestrating the application boot process
├── 📁 styles/               # CSS styling files
│   ├── 📁 components/       # Component-specific styles
│   │   ├── header.css       # Styles for the top navigation bar and logo
│   │   ├── loader.css       # Styles for the loading animations
│   │   ├── progress.css     # Styles for the top progress bar
│   │   ├── summary.css      # Styles for the bottom data aggregation board
│   │   ├── task-form.css    # Styles for the Add/Edit task input forms
│   │   ├── tasks.css        # Styles for the task list and menu options
│   │   ├── timer.css        # Styles for the countdown clock and timer buttons
│   │   └── toast.css        # Styles for the toast notifications
│   ├── base.css             # Contains CSS variables (colors, fonts) and global resets
│   ├── login.css            # Styles specific to the login page
│   └── style.css            # The main CSS file that imports all the components
├── .env                     # Environment variables file
├── .gitignore               # Files and folders ignored by Git
├── db.json                  # Fake Database for JSON Server (with Bcrypt hashed passwords)
├── index.html               # The main HTML skeleton/layout of the application
├── login.html               # The secure login page layout
├── package-lock.json        # Automatically generated exact dependency tree
├── package.json             # Project configuration, scripts, and dependencies
└── README.md                # Project documentation
```

## File Roles & Responsibilities

- **Data & API Layer (`apiClient.js`, `storage.js`, `localDB.js`)**:
  Manages how data is saved and retrieved. `apiClient.js` acts as an Interceptor to automatically attach JWT Bearer tokens. `storage.js` handles API requests, using `localDB.js` (`localStorage`) as a fallback.

- **Business Logic Layer (`authLogic.js`, `taskLogic.js`, `timerLogic.js`)**:
  The "brain" of the app. These files contain zero HTML or DOM references. They strictly handle array operations, countdown timers, math calculations, and state management.

- **UI & Presentation Layer (`ui*.js`, `dom.js`)**:
  The "hands and eyes" of the app.
  - `dom.js`: Acts as the single source of truth for selecting DOM elements.
  - `ui*.js` (e.g., `uiTasks.js`, `uiTimer.js`, `uiHeader.js`): Listens for user interactions, triggers the Logic Layer, and safely updates the UI.

- **The Orchestrator (`main.js`)**:
  The main controller that connects all independent UI modules together and initializes the application sequentially once the DOM is fully loaded.

## Requirements

- Build a static UI and integrate JavaScript logic.
- Work fine on the latest versions of Chrome and MS Edge browsers.
- Use ES6 module syntax (`import`/`export`).

## How to run

### 1. Clone or download the project to your computer

**Clone by Git:**

```bash
git clone [https://github.com/lebalong123work/long-le-internship.git](https://github.com/lebalong123work/long-le-internship.git)
cd long-le-internship/javascript-training/pomofocus
```

_Or download the .zip file directly, then extract it to your project folder._

### 2. Open the project in a browser using VSCode

This project uses **[Parcel](https://parceljs.org/)** as the development server and code bundler instead of the traditional Live Server. Parcel is more powerful; it supports code splitting (modules) and automatically updates the interface instantly whenever you modify the code.

## Prerequisites

To run Parcel, you need to have **Node.js** installed on your computer.

1. Check if it is already installed by opening your Terminal (or CMD/PowerShell) and typing: `node -v`
2. If you encounter an error or it is not installed, visit the [Node.js](https://nodejs.org/) homepage, download the **LTS (Long Term Support)** version, and install it just like any other software (simply click "Next" to complete the process).

## Project Installation & Execution Guide

**Step 1: Open the project in the Terminal**
You need to install the following two tools to read the code and run the project:

## 1. Visual Studio Code (VS Code)

- **What it is:** A tool used to open and edit code.
- **How to install:**
  1. Go to [code.visualstudio.com](https://code.visualstudio.com).
  2. Download the installer for your operating system (Windows, Mac, or Linux).
  3. Run the installer and click **Next** until it completes.

---

## 2. Node.js

- **What it is:** A required environment to run package commands (like `npm`).
- **How to install:**
  1. Go to [nodejs.org](https://nodejs.org).
  2. Download the **LTS (Long Term Support)** version.
  3. Open the file and follow the standard installation steps.

## Step 2: Download Code

1. Download the project code folder (`practices-pomofocus`) to your computer.
2. Open **VS Code**.
3. On the top menu, click **File > Open Folder...** and select the `practices-pomofocus` folder to open it.

## Step 3: Install Project Dependencies

1. In **VS Code**, open the Terminal (command window) by pressing **Ctrl + `** (the backtick key right below **Esc** on your keyboard).
2. In the Terminal window at the bottom, type the following command and press **Enter**:

```bash
   npm install
```

## Step 4: Run the Project (Important)

To run the project smoothly, you need to run two parts at the same time: the **Database (Backend)** and the **Web Interface (Frontend)**. You will need two Terminal windows.

### 1. Start the Database (JSON Server)

In your open Terminal, type the following command and press **Enter**:

```bash
   npm run server
```

- **Success Indicator: You will see a blue banner with "JWT Auth" and JSON Server started on PORT 3000. Keep this Terminal running—do not close it**

---

### 2. Start the Web Interface (Parcel)

1. Look at the top-right corner of the Terminal panel in **VS Code** and click the **`+` (plus)** icon to open a second Terminal window.
2. In this second Terminal, type the following command and press **Enter**:

```bash
   npx parcel index.html
```

- **Success Indicator:** The Terminal will show a green message saying `Server running at http://localhost:1234` (or a similar port).

---

## Step 5: View the Result

1. Open your web browser (Chrome, Edge, etc.).
2. Go to: `http://localhost:1234`
3. Your web interface should now appear! The task data is fetched from `http://localhost:3000` (the JSON Server you started in Step 4.1).

> **Note:** Whenever you edit the code and save it (**Ctrl + S**), the browser will automatically update immediately.

---

##Build Instructions (For Deployment)

When the project is complete and you want to export the code for deployment to a hosting service (such as Vercel, Netlify, or GitHub Pages), follow these steps:

1. Stop the running server by pressing `Ctrl + C` in the Terminal.
2. Run the command:

```bash
npx parcel build index.html

```

Parcel will automatically optimize and compress your code, outputting the result to a folder named `dist/`. You simply need to use the files in this `dist/` folder for your online deployment.

## Step 6: Test Authentication (JSON Server Auth)

This project uses `json-server-auth` to secure API requests. You must log in to fetch or manage tasks.

**How to create a new account (Using Console):**
Because the Registration UI is not yet built, you can register a new user directly using the browser's DevTools.

1. Open the project in your browser (`http://localhost:1234`).
2. Press **F12** to open Developer Tools, and click on the **Console** tab.
3. Copy and paste the following code into the Console, then press **Enter**:

```
fetch("http://localhost:3000/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email: "namegmail.com", password: "name@123" })
})
.then(res => res.json())
.then(data => console.log("Successful registration of the Magnetic Card is:", data));
```

**How to log in:**

1. Once the console shows "Successful registration...", go to the **Sign In** page on the web interface.
2. Log in using the account you just created:

- **Email:** name@gmail.com
- **Password:** name@123

3. Once logged in, an `accessToken` is securely saved in `localStorage`. The `apiClient.js` will automatically attach this token (`Bearer <token>`) to all API requests. If you don't log in, the API will return a `401 Unauthorized` error.
