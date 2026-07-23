```markdown
# JavaScript Practice - Pomofocus

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

```text
📁 pomofocus-app/
├── 📁 css/
│   ├── 📁 components/
│   │   ├── header.css       # Styles for the top navigation bar and logo
│   │   ├── progress.css     # Styles for the top progress bar
│   │   ├── summary.css      # Styles for the bottom data aggregation board
│   │   ├── task-form.css    # Styles for the Add/Edit task input forms
│   │   ├── tasks.css        # Styles for the task list and menu options
│   │   └── timer.css        # Styles for the countdown clock and timer buttons
│   ├── base.css             # Contains CSS variables (colors, fonts) and global resets
│   └── style.css            # The main CSS file that imports all the files above
├── 📁 icons/                # Folder containing all image icons
├── index.html               # The main HTML skeleton/layout of the application
├── main.js                  # The entry point that initializes the app when loaded
├── taskLogic.js             # Core JS logic: Manages arrays, calculations, and data
└── ui.js                    # Core JS UI: Handles DOM updates, clicks, and rendering HTML
```

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
cd long-le-internship\javascipt-training\practices-pomofocus
```

*Or download the .zip file directly, then extract it to your project folder.*

### 2. Open the project in a browser using VSCode

Because this project uses JavaScript ES6 Modules (`type="module"`), you cannot just double-click the `index.html` file to run it.

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension (if you haven't already).
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The app will automatically open in your default browser (Chrome is recommended).

```
