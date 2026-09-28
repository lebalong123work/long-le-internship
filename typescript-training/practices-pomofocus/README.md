# TypeScript Practice - Pomofocus Clone

This project is a front-end application focused on building a Pomodoro Web Application inspired by Pomofocus.io. Originally built with Vanilla JavaScript (ES6), the project has been fully migrated to **TypeScript (Strict Mode)** with **Path Aliases (`@/`)**, **ESLint**, and **Husky Git Hooks** to ensure type safety, clean architecture, and code quality.

## Project Overview

- **Design Source**:
  - Pomofocus.io UI reference
- **Tech Stack**:
  - **HTML5 & CSS3** (Component-based CSS architecture)
  - **TypeScript** (Strict Mode, ES2022, Custom Path Aliases `@/*`)
  - **Parcel** (Web application bundler & development server)
  - **tsc-alias** (Transforms TypeScript path aliases `@/` into relative paths after compilation)
  - **ESLint & typescript-eslint** (Static code analysis for catching syntax and logic issues)
  - **Husky** (Git hooks automating TypeScript type-checking and ESLint verification before committing/pushing code)
  - **JSON Server & JSON Server Auth** (Mock REST API with JWT Authentication & Bcrypt password hashing)
  - **localStorage** (Client-side fallback data persistence)
- **Goals**:
  - Migrate a modular JavaScript codebase to strict TypeScript (`strict`, `noImplicitAny`, `strictNullChecks`).
  - Define clear `interface` and `type` contracts across API, Business Logic, and UI layers.
  - Configure clean import statements using Path Aliases (`@/config`, `@/logic/...`, `@/ui/...`) without file extensions.
  - Enforce automated code quality checks (TypeScript + ESLint) via Git Hooks prior to pushing code.

### Related Resources

- **Timeline**: Started July 6th, 2026.
- **Developer**: Lê Bá Long.
- **Editor**: Visual Studio Code (VS Code).

---

## Features

- **Task Management (CRUD)**: Add, edit, and delete tasks seamlessly.
- **Task Status**: Mark tasks as completed (visualized with a red checkbox and strikethrough text).
- **Clear Data**: "Delete all" action to quickly clear the entire task list.
- **Dynamic Aggregation Data**:
  - Automatically calculates total Estimated (`Est`) Pomodoros.
  - Tracks Actual (`Act`) Pomodoros completed.
  - Dynamically calculates the `"Finish At"` timestamp based on current time and remaining Pomodoros.
- **Security & Authentication**: Secure login flow using JWT (JSON Web Tokens) and automatic Bearer token injection via an API interceptor.

---

## Folder Structure

~~~text
📁 practices-pomofocus/
├── 📁 .husky/                # Husky Git hooks (runs type-check & lint before commit/push)
├── 📁 .vscode/               # VS Code editor configurations
├── 📁 icons/                 # Image assets and SVG icons
├── 📁 src/                   # Core TypeScript Source Code
│   ├── 📁 api/               # Network & Data Layer
│   │   ├── apiClient.ts      # API Interceptor: Automatically injects JWT Bearer tokens
│   │   ├── localDB.ts        # Fallback localStorage database operations
│   │   └── storage.ts        # Handles API requests (fetch, create, update, remove tasks)
│   ├── 📁 config/            # Configuration Layer
│   │   └── config.ts         # Application constants and environment configurations
│   ├── 📁 logic/             # Business Logic Layer (Pure TypeScript, zero DOM manipulation)
│   │   ├── authLogic.ts      # User authentication, JWT decoding, and login state
│   │   ├── taskLogic.ts      # Task state management, interfaces, and Pomodoro calculations
│   │   └── timerLogic.ts     # Countdown intervals, timer modes, and time math
│   ├── 📁 ui/                # Presentation Layer (DOM manipulation & event binding)
│   │   ├── dom.ts            # Centralized DOM element selectors with strict HTML types
│   │   ├── uiButtonState.ts  # Handles dynamic button loading/disabled states
│   │   ├── uiHeader.ts       # Handles user avatar, Sign In/Out toggles, and dropdowns
│   │   ├── uiLoader.ts       # Controls initial loading spinners and transitions
│   │   ├── uiTasks.ts        # Handles task forms, inline editing, and list rendering
│   │   ├── uiTimer.ts        # Handles timer controls and mode switching UI
│   │   └── uiToast.ts        # Displays toast notifications
│   ├── 📁 utils/             # Utilities Layer
│   │   ├── errorHandler.ts   # Centralized global error handling
│   │   └── timeUtils.ts      # Time formatting and finish-time calculation helpers
│   ├── login.ts              # Entry point for the login page (login.html)
│   └── main.ts               # Main entry point orchestrating the application boot process
├── 📁 styles/                # CSS styling files
│   ├── 📁 components/        # Component-specific styles (header, timer, tasks, toast, etc.)
│   ├── base.css              # CSS variables (colors, fonts) and global resets
│   ├── login.css             # Styles specific to the login page
│   └── style.css             # Main stylesheet importing all component styles
├── .env                      # Environment variables file
├── .gitignore                # Files and directories ignored by Git
├── db.json                   # Mock database for JSON Server (with Bcrypt hashed passwords)
├── eslint.config.mjs         # ESLint Flat Configuration for TypeScript
├── index.html                # Main application layout
├── login.html                # Login page layout
├── package.json              # Project scripts, dependencies, and devDependencies
├── tsconfig.json             # TypeScript compiler and Path Alias (@/*) configuration
└── README.md                 # Project documentation
~~~

---

## Architecture & File Responsibilities

- **Data & API Layer (`@/api/*`)**:
  Manages data retrieval and persistence. `apiClient.ts` acts as an HTTP interceptor that attaches JWT Bearer tokens automatically. `storage.ts` coordinates REST API calls and falls back to `localDB.ts` (`localStorage`) when offline or unauthenticated.

- **Business Logic Layer (`@/logic/*`)**:
  The core domain layer containing zero HTML or DOM references. It defines core data structures (`Task`, `SummaryData`, `TimerMode`) and handles array mutations, countdown intervals, and time calculations.

- **UI & Presentation Layer (`@/ui/*`)**:
  - `dom.ts`: Single source of truth for DOM queries, cast to specific TypeScript DOM interfaces (`HTMLInputElement`, `HTMLButtonElement`, `HTMLElement`).
  - `ui*.ts`: Listens for user events, invokes functions from the Logic Layer, and updates the DOM safely.

- **The Orchestrator (`src/main.ts` & `src/login.ts`)**:
  Connects independent UI and logic modules together and initializes the application once the DOM is ready.

---

## Prerequisites

Make sure you have the following tools installed on your computer:

1. **Visual Studio Code (VS Code)**: Download from [code.visualstudio.com](https://code.visualstudio.com/).
2. **Node.js (LTS Version)**: Download from [nodejs.org](https://nodejs.org/).
   - Verify installation by opening your Terminal and running:
     ~~~bash
     node -v
     npm -v
     ~~~

---

## Installation & Execution Guide

### Step 1: Clone the Repository

Open your Terminal and run the following commands to clone the repository and navigate to the project directory:

~~~bash
git clone [https://github.com/lebalong123work/long-le-internship.git](https://github.com/lebalong123work/long-le-internship.git)
cd long-le-internship/typescript-training/practices-pomofocus
~~~

### Step 2: Install Dependencies

Install all required packages (including TypeScript, Parcel, ESLint, Husky, and JSON Server):

~~~bash
npm install
~~~

### Step 3: Run the Project (Requires 2 Terminal Windows)

To run the application with full functionality, run the **Mock Backend Server** and the **Frontend Bundler** simultaneously in two separate Terminal windows:

#### Terminal 1: Start the Database (JSON Server Auth)

~~~bash
npm run server
~~~
- **Success Indicator**: You will see the `json-server-auth` banner running on `http://localhost:3000`. Keep this Terminal open.

#### Terminal 2: Start the Web Application (Parcel)

Click the **`+`** icon in the VS Code Terminal panel to open a second Terminal, then run:

~~~bash
npm start
~~~
- **Success Indicator**: Parcel will bundle the TypeScript modules and start a development server at `http://localhost:1234`. Open `http://localhost:1234` in your browser.

---

## Available Scripts (`package.json`)

Below is the list of configured scripts for development, compilation, and code quality verification:

| Script Command | Underlying Execution | Description |
| :--- | :--- | :--- |
| `npm start` | `parcel index.html` | Starts the Parcel development server with Hot Module Replacement at `http://localhost:1234`. |
| `npm run server` | `json-server-auth db.json --port 3000` | Starts the mock REST API server with JWT authentication on port `3000`. |
| `npm run build` | `parcel build index.html` | Bundles and minifies the application for production into the `dist/` directory. |
| `npm run tsc` | `tsc` | Compiles TypeScript files from `./src` into JavaScript files in `./js`. |
| `npm run watch` | `tsc -w` | Runs the TypeScript compiler in watch mode to monitor changes in real time. |
| `npm run alias` | `tsc-alias` | Replaces `@/` path aliases in the compiled `./js` output with relative paths and `.js` extensions. |
| `npm run type-check` | `tsc --noEmit` | Performs a full TypeScript strict type check across the project without emitting `.js` files. |
| `npm run lint` | `eslint src/` | Runs ESLint across all `.ts` files in `src/` to catch code style and logic errors. |

---

## Automated Code Quality Checks (Git Hooks)

This project uses **Husky** to enforce code quality before changes are committed/pushed to the repository:

1. **`npm run type-check` (`tsc --noEmit`)**: Ensures zero TypeScript type errors exist.
2. **`npm run lint` (`eslint src/`)**: Ensures all TypeScript files adhere to ESLint rules (`no-explicit-any`, `no-unused-vars`, `prefer-const`).

If either check fails, Husky automatically aborts the Git operation until all errors are resolved.

---

## Test Authentication (JSON Server Auth)

This project uses `json-server-auth` to protect task endpoints. You can log in to synchronize tasks with `db.json`.

### 1. Register a New Account (Via Browser Console)

1. Ensure both `npm run server` (port 3000) and `npm start` (port 1234) are running.
2. Open `http://localhost:1234` in your browser and press **F12** to open **Developer Tools** -> **Console** tab.
3. Paste the following snippet and press **Enter** to create a test account:

~~~javascript
fetch("http://localhost:3000/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "name@gmail.com", password: "name@123" }),
})
  .then((res) => res.json())
  .then((data) => console.log("Registration successful:", data));
~~~

### 2. Log In on the Web Interface

1. Click **Sign In** on the top header to navigate to `login.html`.
2. Enter the registered credentials:
   - **Email**: `name@gmail.com`
   - **Password**: `name@123`
3. Upon login, the `accessToken` is stored in `localStorage`, and `apiClient.ts` automatically attaches `Authorization: Bearer <token>` to subsequent API requests.