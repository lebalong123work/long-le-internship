**TYPESCRIPT EXERCISES GUIDE**

This project contains practical TypeScript exercises. Below is a step-by-step guide for beginners on setting up the environment and running the code.

**1. Initial Setup (Required)**

After downloading the code from GitHub to your computer, you need to install the required packages to run TypeScript.

Open your Terminal in the project root folder and run:

```bash
npm install

```

**2. Run TypeScript Files Directly (Recommended)**

You can use `tsx` to run `.ts` files directly and see the results in your Terminal without compiling them first.

Syntax:

```bash
npx tsx <path-to-file.ts>

```

Example:

```bash
npx tsx src/part-1-practice/12-variable-declarations.ts

```

**3. Compile and Run with JavaScript (Standard Node.js)**

If you want to run the code using standard Node.js, you cannot run `.ts` files directly. You need to convert them to `.js` files first.

**Step 1: Compile the project**

Run the command below to compile all files in the `src` folder into `.js` files in the `dist` folder:

```bash
npx tsc

```

**Step 2: Run the JavaScript file**

After the `dist` folder is created, use `node` to run the `.js` file:

```bash
node dist/part-1-practice/12-variable-declarations.js

```

**Folder Structure Notes:**

* **`src/` folder:** Contains all source code (`.ts` files). This is where you write and edit your code.
* **`dist/` folder:** Contains the automatically generated JavaScript code (`.js` files). You do not need to edit or worry about files in this folder.