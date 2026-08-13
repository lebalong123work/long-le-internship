# JavaScript Practice - Pomofocus Clone

This project is a front-end exercise focused on building a Pomodoro Web Application, heavily inspired by Pomofocus.io. The purpose is to apply foundational concepts of HTML5, CSS3, and JavaScript (ES6), including DOM manipulation, data management, and asynchronous operations.

## Project Overview

- **Design Source**: 
  - Pomofocus.io UI reference
- **Tech Stack**: 
  - HTML5 & CSS3
  - JavaScript (ES6 syntax)
  - JSON Server (for mocking a full REST API)
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

## Folder Structure

This project uses a modular component-based approach to keep the code clean and easy to maintain.

📁 practices-pomofocus/
├── 📁 css/
│   ├── 📁 components/
│   │   ├── header.css       # Styles for the top navigation bar and logo
│   │   ├── progress.css     # Styles for the top progress bar
│   │   ├── summary.css      # Styles for the bottom data aggregation board
│   │   ├── task-form.css    # Styles for the Add/Edit task input forms
│   │   ├── tasks.css        # Styles for the task list and menu options
│   │   └── timer.css        # Styles for the countdown clock and timer buttons
│   ├── base.css             # Contains CSS variables (colors, fonts) and global resets
│   ├── login.css            # Styles specific to the login page
│   └── style.css            # The main CSS file that imports all the components
├── 📁 icons/                # Folder containing all image assets and SVG icons
├── 📁 javascript/           # Core Logic & UI Components
│   ├── authLogic.js         # Logic: User authentication (login/logout) state
│   ├── dom.js               # Dictionary: Centralized DOM elements selection
│   ├── storage.js           # API: Handles all fetch requests and localStorage
│   ├── taskLogic.js         # Logic: Manages arrays, Pomodoro calculations
│   ├── timerLogic.js        # Logic: Countdown intervals and time math
│   ├── ui_header.js         # UI: Handles Avatar/Sign In toggles and dropdowns
│   ├── ui_tasks.js          # UI: Handles task forms, editing, and list rendering
│   └── ui_timer.js          # UI: Handles Timer buttons and mode switching
├── db.json                  # Fake Database for JSON Server
├── index.html               # The main HTML skeleton/layout of the application
├── login.html               # The login page layout
├── login.js                 # Handles the login form submission
└── main.js                  # The Entry Point that coordinates and boots the app

## File Roles & Responsibilities

- **`index.html`**: Acts as the main frame. It holds empty container tags where JavaScript will inject the content.
- **`css/base.css`**: Defines the theme colors and font sizes using CSS Variables (`:root`), making it easy to change the app's look in one place.
- **`taskLogic.js`**: The "brain" of the app. It does not touch the HTML. It only handles the math, array filtering, and logic rules.
- **`ui.js`**: The "hands" of the app. It listens for user clicks (Event Listeners), reads data from `taskLogic.js`, and prints the results onto the HTML screen.
- **`main.js`**: The starter file. It links everything together and tells `ui.js` to start running when the web page finishes loading.

## Requirements

- Build a static UI and integrate JavaScript logic.
- Work fine on the latest versions of Chrome and MS Edge browsers.
- Use ES6 module syntax (`import`/`export`).

## How to run

### 1. Clone or download the project to your computer

**Clone by Git:**

```bash
git clone [https://github.com/lebalong123work/long-le-internship.git](https://github.com/lebalong123work/long-le-internship.git)
cd long-le-internship/javascript-training/pomofocus-clone
```

*Or download the .zip file directly, then extract it to your project folder.*

### 2. Open the project in a browser using VSCode

This project uses **[Parcel](https://parceljs.org/)** as the development server and code bundler instead of the traditional Live Server. Parcel is more powerful; it supports code splitting (modules) and automatically updates the interface instantly whenever you modify the code.
## Prerequisites
To run Parcel, you need to have **Node.js** installed on your computer.
1. Check if it is already installed by opening your Terminal (or CMD/PowerShell) and typing: `node -v`
2. If you encounter an error or it is not installed, visit the [Node.js](https://nodejs.org/) homepage, download the **LTS (Long Term Support)** version, and install it just like any other software (simply click "Next" to complete the process).
## Project Installation & Execution Guide

**Step 1: Open the project in the Terminal**
- Open the project folder in Visual Studio Code (VS Code).
- Open the integrated terminal in VS Code using the shortcut: `` Ctrl + ` `` (the backtick key located below the ESC key).

**Step 2: Install necessary libraries**
In the terminal window, type the following command and press Enter to automatically download Parcel and related tools to the project folder (this process takes about a few dozen seconds):
```bash
npm install
```
*(Note: You only need to run this command once after downloading the code to your machine).*

**Step 3: Start the Server with Parcel**
After installation is complete, enter the following command to run the project:

```bash
npx parcel index.html

```

**Step 4: View the Result**

* When the Terminal displays a green line saying `Server running at http://localhost:1234`, it means the setup was successful!
* Keep the Terminal window open (do not close it).
* Open your web browser (Chrome/Edge/Safari) and visit the link: **http://localhost:1234**

You have successfully launched the project. Now, whenever you modify and save your HTML/CSS/JS code, the browser will automatically update to reflect the changes immediately.

---

##Build Instructions (For Deployment)

When the project is complete and you want to export the code for deployment to a hosting service (such as Vercel, Netlify, or GitHub Pages), follow these steps:

1. Stop the running server by pressing `Ctrl + C` in the Terminal.
2. Run the command:

```bash
npx parcel build index.html

```

Parcel will automatically optimize and compress your code, outputting the result to a folder named `dist/`. You simply need to use the files in this `dist/` folder for your online deployment.
