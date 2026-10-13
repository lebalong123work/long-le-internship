# User Management UI

A React and TypeScript practice project that converts the user-management screen from an older TypeScript project into reusable React components.

The goal is **UI only**: recreate the screen and its visible interaction states. The app uses sample data in React state to demonstrate the interface. It does not connect to an API, database, or browser storage.

## Run the project

### Requirements

- Node.js and npm
- A modern web browser

### Install and start

Open a terminal in the project folder and run:

```bash
npm install
npm run dev
```

Vite prints a local URL in the terminal, usually `http://localhost:5173`. Open that URL in your browser.

### Other commands

```bash
npm run build
```

Checks the TypeScript project and creates the production build in `dist/`.

```bash
npm run lint
```

Runs ESLint to check the project source for common code problems.

```bash
npm run preview
```

Serves the production build locally. Run `npm run build` first.

## What the app can do

- Show a sample list of users.
- Search users by email, first name, last name, or phone number.
- Open a form to add a user.
- Edit a user's information.
- Ask for confirmation before deleting a user.
- Show a temporary toast message after an action.

These interactions are UI demonstrations backed by React state. Changes are temporary and are lost when the page reloads. There is no backend, API service, or persistent data storage in this project.

## Tools and why they are used

| Tool | Purpose in this project |
| --- | --- |
| React | Builds the interface from reusable components and manages UI state. |
| TypeScript | Adds types for users, component props, and browser events. |
| Vite | Runs the local development server and builds the app for production. |
| ESLint | Checks TypeScript, React/JSX, React DOM, and accessibility rules. |
| CSS | Styles the layout, table, toolbar, buttons, and dialogs. CSS variables keep colors and other design values in one place. |
| npm | Installs project packages and runs the scripts defined in `package.json`. |

The `@` import alias points to the `src/` directory. For example, `@/components/table/UserTable` refers to `src/components/table/UserTable.tsx`.

## Checks before commit

The repository uses a Husky `pre-commit` hook. When a commit includes staged files under `react-training/practices-react-ui/`, the hook runs:

```bash
npm --prefix react-training/practices-react-ui run lint
npm --prefix react-training/practices-react-ui run build
```

If either check fails, that commit is stopped. The hook is stored in the repository's shared Husky configuration; commits that do not include files from this React project do not run these React checks.

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

- `index.html` — The browser page that contains the React mount point (`#root`) and loads `src/main.tsx`.
- `package.json` — Lists dependencies and the `dev`, `build`, `lint`, and `preview` commands.
- `package-lock.json` — Records exact installed package versions for consistent installs.
- `vite.config.ts` — Configures Vite, its React plugin, and the `@` alias.
- `tsconfig.json` — Connects the TypeScript configuration files.
- `tsconfig.app.json` — TypeScript settings for the browser application, including the `@/*` path alias.
- `tsconfig.node.json` — TypeScript settings for Node-based project files such as `vite.config.ts`.
- `eslint.config.js` — Configures ESLint checks.
- `public/` — Static files served directly from the site root, such as the favicon.
- `dist/` — Generated production output. It is created by `npm run build`.

### Application entry and state

- `src/main.tsx` — Imports the master stylesheet and renders `<App />` into the page.
- `src/App.tsx` — Creates the sample users, owns the UI state, filters the list, and coordinates the Add/Edit/Delete dialogs and toast messages. It does not call a backend.
- `src/types/user.ts` — Defines the shared `User` data shape used by the app, form, and table.

### Components

- `src/components/layout/AppLayout.tsx` — Places the sidebar and main content next to each other.
- `src/components/layout/MainPanel.tsx` — Provides the main content area.
- `src/components/layout/Sidebar.tsx` — Renders the brand logo and user-management navigation item.
- `src/components/toolbar/Toolbar.tsx` — Renders the search input and Add New button.
- `src/components/table/UserTable.tsx` — Renders the table header, user rows, or the empty state.
- `src/components/table/UserTableHeader.tsx` — Renders the table column headings.
- `src/components/table/UserTableRow.tsx` — Renders one user and its Edit/Delete actions.
- `src/components/table/EmptyState.tsx` — Renders a message when no users match the search.
- `src/components/modal/UserFormModal.tsx` — Renders the Add/Edit user form and submits its values.
- `src/components/modal/FormField.tsx` — Renders a labeled input and an optional validation message.
- `src/components/modal/ConfirmationDialog.tsx` — Asks the user to confirm a delete action.
- `src/components/common/Overlay.tsx` — Provides the modal backdrop and closes it when the backdrop is clicked.
- `src/components/common/Button.tsx` — Provides a reusable button with visual variants.
- `src/components/common/Toast.tsx` — Displays temporary success or error feedback.

### Styles and images

- `src/styles/index.css` — Imports the design tokens and all global/component stylesheets.
- `src/styles/variables.css` — Defines shared color, font, radius, and shadow tokens.
- `src/styles/global.css` — Defines the CSS reset, page defaults, and visible keyboard focus styles.
- `src/styles/layout.css` — Styles the app wrapper and main content panel.
- `src/styles/sidebar.css` — Styles the navigation sidebar.
- `src/styles/toolbar.css` — Styles the search field and Add New button.
- `src/styles/table.css` — Styles the user table, rows, actions, and empty state.
- `src/styles/overlay.css` — Styles the modal backdrop.
- `src/styles/btn.css` — Styles the shared button variants.
- `src/styles/form.css` — Styles the Add/Edit form modal and its fields.
- `src/styles/confirmation.css` — Styles the delete confirmation dialog.
- `src/styles/toast.css` — Styles temporary success and error notifications.
- `src/assets/images/managers/` — Contains UI images such as the sidebar logo, search icon, and form error icon.
- `public/favicon.svg` — The browser tab icon referenced from `index.html`.

There are no `scripts/` or `constants/` folders because the React UI does not use the old project's controller/service logic or a separate set of shared constants. Component-only prop types stay next to their components; the shared user data type is in `src/types/user.ts`.
