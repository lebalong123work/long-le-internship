# Store

A responsive e-commerce **frontend** for a clothing store, built as a production-like React app.
The backend is mocked with **json-server**, behind a service layer, so it can be replaced by a real API later without changing the UI.

---

## Features (MVP)

| Area | What users can do |
|------|-------------------|
| Home | Hero banner, "Best Seller" products with category tabs (T-Shirt · Jacket · Shirt · Jeans) |
| Product Detail | Image gallery, choose color / size / quantity, add to cart, add to wishlist, similar products |
| Search | Suggestions while typing + a full results page (`/search?q=`) |
| Auth | Log In / Sign Up in a **modal** (no separate pages). Opened with `?auth=login` in the URL |
| Cart | Login required. Change quantity, remove items, live total. Saved per user on the server |
| Wishlist | Login required. Saved per user on the server — the same on every device |
| Checkout | Shipping address + payment method (mock) → order success page |
| Account | Order history, profile, change password |
| Other | Shop, About Us and Contact show "This page is under development"; 404 page for unknown URLs |

Cross-cutting:
- **Responsive** for desktop and mobile (desktop from Figma, mobile layout designed by us).
- **Loading / error / empty states** on every page that loads data (skeleton, "Try again", helpful empty message).
- **Toast notifications** for action results (added to cart, logged in, errors…).

Users: **Guest** (browse, search) and **Customer** (everything above). There is no admin or seller panel.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript 5.9 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 (`createBrowserRouter`) |
| Server state | TanStack Query 5 |
| Client state | Zustand 4 (auth session, UI state) |
| Forms | React Hook Form + Zod |
| Mock backend | json-server 1.0.0-beta.15 (pinned) + concurrently |
| Testing | Vitest 4 + React Testing Library + jsdom |
| Code quality | ESLint 10 (flat config) + typescript-eslint, Prettier |

---

## Getting Started

### Requirements

- **Node.js** 22.12+ (required by json-server 1.x)
- **npm** 11.21+ recommended (npm 11.5 crashed with an `edgesOut` error on this project)

### Install and run

```bash
npm install
```

```bash
npm run dev
```

This starts both:
- the app (Vite) at http://localhost:5173
- the mock API (json-server) at http://localhost:3001

Optional: copy `.env.example` to `.env` to change the API URL or the fake network delay.

### Mock API data

- Seed data: `server/db.seed.json` (committed)
- Working copy: `server/db.json` (created automatically, git-ignored — json-server writes changes here)
- Reset to the seed: `npm run db:reset`
- Test account: `user@store.com` / `user123`

---

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the app (:5173) and the mock API (:3001) together |
| `npm run dev:client` | Start only the app |
| `npm run dev:server` | Start only the mock API |
| `npm run db:reset` | Reset mock API data to the seed |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run type-check` | Type-check app code (`tsconfig.app.json`) and config files (`tsconfig.node.json`) |
| `npm run lint` | Run ESLint on `src/` |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |

Before finishing any change, run `type-check`, `lint`, `test` and `build`.

---

## Project Structure

```
server/           mock API data (db.seed.json) + helper script
src/
├── components/   ui/ (basic, no business logic) · layout/ (Header, Footer…) · shared/ (ProductCard…) · auth/ (login modal)
├── pages/        one folder per route — composes components and hooks
├── services/     API service layer — the ONLY place that talks to the backend
├── stores/       Zustand stores (auth session, UI state)
├── hooks/        reusable custom hooks
├── types/        TypeScript interfaces (source of truth for data shapes)
├── constants/    routes, query keys, categories, order status
├── utils/        pure helper functions
├── router/       route config + route guards
└── test/         test setup
```

Layer rules:
- `components/ui` never imports stores or services.
- Pages and components never call `fetch` directly — they use hooks that call `services/`.
- Paths use the `@/` alias (`@/services/productService`).

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| Service layer between UI and backend | Switch from json-server to a real API by changing only `services/` |
| TanStack Query for server data, Zustand only for client state | One source of truth for cart / wishlist / orders (the server); no copies to keep in sync |
| Login modal state in the URL (`?auth=login&redirect=/checkout`) | Links can open it, the Back button closes it, it survives a refresh |
| Guests get the login modal for cart / wishlist actions, and the action runs after login | Cart and wishlist belong to the account and work across devices |
| Shared states and toast components | Every page behaves the same; change it in one place |

---

## Roadmap

- [x] Requirements and architecture
- [x] App skeleton: Vite, TypeScript, Tailwind, ESLint, Vitest, routing
- [x] Update skeleton to the final scope: json-server, login modal, remove old admin/seller stubs
- [ ] Task breakdown
- [ ] Shared UI: layout, toast, loading / error / empty states
- [ ] Auth modal + route guards
- [ ] Home → Product Detail → Cart → Checkout → Order Success
- [ ] Wishlist, Search, Order History, Profile
- [ ] "Under development" pages + 404
- [ ] Responsive pass (mobile)

---

## Notes

- Authentication is a **UI simulation** with mock data — it is not a real security mechanism.
- UI language: English.
