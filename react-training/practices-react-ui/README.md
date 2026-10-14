# User Management UI

This is a React and TypeScript practice project. It changes a user-management screen into reusable React components.

The goal is to practice **building a user interface and browser interactions**. The app uses sample data in React state. It does not connect to an API or database, and it does not save data after the page is refreshed.

## Run the project

### Requirements

- Node.js and npm
- A modern web browser

### Install and run

Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Vite will show a local URL in the terminal. It is usually `http://localhost:5173`. Open that URL in your browser.

> This project has a `dev` script, not a `start` script. Use `npm run dev`, not `npm start`.

### Other commands

```bash
npm run build
```

Checks the TypeScript code and creates a production build in `dist/`.

```bash
npm run lint
```

Runs ESLint to check the source code.

```bash
npm run preview
```

Runs the production build locally. Run `npm run build` first.

## How does React work in this project?

### HTML and JSX

HTML describes elements on a web page. For example:

```html
<button type="button">Add User</button>
```

In React, we usually write the interface inside a `.tsx` file using JSX:

```tsx
function AddButton() {
  return <button type="button">Add User</button>;
}
```

The `<button>` looks like HTML, but it is inside a React and TypeScript function. React reads the JSX and creates page elements from it. The `.tsx` file extension means the file contains TypeScript and JSX.

You do not need a separate `.html` file for every component. A static HTML button does not know which React function to call, what props to use, or which state to update. JSX connects the interface to these actions.

### App startup: `index.html` → `main.tsx` → `App`

1. **`index.html`** is the HTML page opened by the browser. It has a place for React to render the app:

   ```html
   <div id="root"></div>
   <script type="module" src="/src/main.tsx"></script>
   ```

   `#root` starts empty. It is a reserved place where React puts the app.

2. **`src/main.tsx`** finds `#root` and asks React to show `<App />` there:

   ```tsx
   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <App />
     </StrictMode>,
   );
   ```

3. **`src/App.tsx`** puts together the main parts of the app: the sidebar and the user-management page:

   ```tsx
   <AppLayout
     sidebar={<Sidebar />}
     mainContent={<UserManagementPage />}
   />
   ```

4. React shows the child components. This simple tree shows how the interface is arranged:

   ```text
   index.html
   └── #root
       └── App
           └── AppLayout
               ├── Sidebar
               └── MainPanel
                   └── UserManagementPage
                       ├── Toolbar
                       ├── UserTable
                       ├── UserFormModal
                       ├── ConfirmationDialog
                       └── Toast
   ```

`index.html` is still important. It is the first HTML page and the starting point for React. The changing parts of the screen are written as JSX in React components, not as separate HTML files.

### Components, props, state, and events

- **Component**: a function that creates part of the interface. For example, `UserTable` shows users and `Sidebar` shows the menu.
- **Props**: data or functions passed from a parent component to a child. For example, `UserTable` receives `users`, `onEdit`, and `onDelete`.
- **State**: data that can change when the user interacts with the app. For example, `UserTable` stores the current page, and `UserFormModal` stores the form input.
- **Event**: something the user does, such as clicking a button with `onClick` or typing in a field with `onChange`.

Here is a small example of state and an event:

```tsx
function Example() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

When the button is clicked, the event updates the state. React sees the change and updates the part of the page that needs it. You do not need to find an element with `document.querySelector` and change its content by hand.

Adding a user in this project follows a similar flow:

1. The user clicks **Add New** in `Toolbar`.
2. `Toolbar` calls the `onOpenAddModal` function it received through props.
3. `UserManagementPage` changes the `isFormModalOpen` state.
4. React shows `UserFormModal`.
5. The form stores the user's input in its own state and calls `onSubmit` when sent.
6. `UserManagementPage` updates the `users` list, and React updates the table.

### Why is state in both the parent and child components?

Not every component needs its own state. Put state where it is needed:

- If only one component needs the data, keep the state in that component. For example, `UserTable` manages the current page and the number of rows per page.
- If several components need the same data or need to update it, keep the state in their nearest shared parent. For example, `UserManagementPage` keeps the users because it updates the list and passes it to the table.
- A component that only shows props may not need state. For example, `UserTableRow` shows one user and calls the edit and delete functions.

This keeps all state from piling up in one file. It also avoids keeping separate copies of the same data in different components.

## What the app can do

- Show a sample list of users.
- Search by email, first name, last name, or phone number.
- Open a form to add a user.
- Edit a user's information.
- Ask for confirmation before deleting a user.
- Show a temporary toast message after an action.
- Change pages and choose how many users to show on each page.
- Show a sidebar and a top navigation bar.

These actions use React state. Changes are lost when the page is refreshed. Some toolbar and top navigation controls are examples of the design and do not have working actions yet.

## Tools

| Tool | Purpose |
| --- | --- |
| React | Builds the interface from components and manages UI state. |
| TypeScript | Checks user data, component props, and browser event types. |
| Vite | Runs the development server and builds the app. |
| ESLint | Checks TypeScript and React code for common problems. |
| CSS | Styles the interface. CSS variables keep shared colors and design values in one place. |
| npm | Installs packages and runs project commands. |

The `@` import alias points to the `src/` folder. For example, `@/components/table/UserTable` points to `src/components/table/UserTable.tsx`.

## Checks before commit

The repository uses a Husky `pre-commit` hook. If a commit includes staged files in `react-training/practices-react-ui/`, the hook runs:

```bash
npm --prefix react-training/practices-react-ui run lint
npm --prefix react-training/practices-react-ui run build
```

The commit stops if either check fails. The hook is part of the repository's shared Husky setup. Commits without files from this React project do not run these checks.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── public/
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── pages/
    │   └── UserManagementPage.tsx
    ├── assets/
    │   └── images/
    │       └── managers/
    ├── components/
    │   ├── common/       # Button, Overlay, Toast
    │   ├── layout/       # AppLayout, MainPanel, Sidebar
    │   ├── modal/        # User form, fields, delete confirmation
    │   ├── table/        # Table, header, rows, empty state
    │   └── toolbar/      # Search and Add New
    ├── styles/
    │   ├── index.css
    │   └── *.css
    └── types/
        └── user.ts
```

## What the main files do

### Project root

- `index.html` — The browser page with the React mount point (`#root`). It loads `src/main.tsx`.
- `package.json` — Lists packages and the `dev`, `build`, `lint`, and `preview` commands.
- `package-lock.json` — Saves the exact package versions used by the project.
- `vite.config.ts` — Sets up Vite, the React plugin, and the `@` alias.
- `tsconfig.json` — Connects the TypeScript settings files.
- `tsconfig.app.json` — TypeScript settings for the browser app, including the `@/*` path alias.
- `tsconfig.node.json` — TypeScript settings for Node.js files such as `vite.config.ts`.
- `eslint.config.js` — Sets up ESLint rules.
- `public/` — Static files served from the site root, such as the favicon.
- `dist/` — Production files created by `npm run build`.

### App entry and state

- `src/main.tsx` — Loads the main stylesheet and renders `<App />` in the page.
- `src/App.tsx` — Puts the app layout, sidebar, and user-management page together.
- `src/pages/UserManagementPage.tsx` — Manages state and actions for the user page: search, add, edit, delete, dialogs, and toast messages.
- `src/types/user.ts` — Defines the shared `User` data type for the app, form, and table.

### Components

- `src/components/layout/AppLayout.tsx` — Places the sidebar next to the main content.
- `src/components/layout/MainPanel.tsx` — Shows the top navigation and main content area.
- `src/components/layout/Sidebar.tsx` — Shows the logo, navigation links, and Logout.
- `src/components/layout/TopNavigation.tsx` — Shows the top navigation bar.
- `src/components/toolbar/Toolbar.tsx` — Shows the list title, search, column selector, filter, and Add New button.
- `src/components/table/UserTable.tsx` — Shows the table, pagination, page-size selector, and empty state.
- `src/components/table/UserTableHeader.tsx` — Shows the table column headings.
- `src/components/table/UserTableRow.tsx` — Shows one user and its Edit/Delete buttons.
- `src/components/table/EmptyState.tsx` — Shows a message when no users match the search.
- `src/components/modal/UserFormModal.tsx` — Shows the Add/Edit form and stores its input values.
- `src/components/modal/FormField.tsx` — Shows a labeled input and an optional error message.
- `src/components/modal/ConfirmationDialog.tsx` — Asks the user to confirm a delete action.
- `src/components/common/Overlay.tsx` — Shows the modal backdrop and closes it when the backdrop is clicked.
- `src/components/common/Button.tsx` — Provides a shared button with different styles.
- `src/components/common/Toast.tsx` — Shows a temporary success or error message.

### Styles and images

- `src/styles/index.css` — Loads the design variables and all other stylesheets.
- `src/styles/variables.css` — Defines shared colors, fonts, corner sizes, and shadows.
- `src/styles/global.css` — Defines the page defaults, reset styles, and keyboard focus styles.
- The other CSS files in `src/styles/` — Style the layout, sidebar, toolbar, table, overlay, buttons, form, dialog, toast, and top navigation.
- `src/assets/images/managers/` — Stores images used in the interface, such as the logo, search icon, and form error icon.
- `public/favicon.svg` — The browser tab icon used by `index.html`.

There are no `services/` folders because the React UI does not call an API. There are no `constants/` or `scripts/` folders because the project does not need them yet. Types used by one component stay near that component. The shared user type is in `src/types/user.ts`.

## Vietnamese guide

The Vietnamese guide is in a separate file:

- [React basics for this project](./docs/REACT-BASICS.vi.md)
