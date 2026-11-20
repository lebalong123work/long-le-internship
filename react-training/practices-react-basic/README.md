# Store

A responsive e-commerce **frontend** for a clothing store, built as a production-like React app.
The backend is mocked with **json-server**, behind a service layer, so it can be replaced by a real API later without changing the UI.

---

## Live Demo

| | Link |
|---|---|
| App (Vercel) | https://mangcoding-store-seven.vercel.app |
| Mock API (Render) | https://long-le-internship.onrender.com/products |

**Demo account** (mock data, not a real account):

| Email | Password |
|---|---|
| `user@store.com` | `user123` |

Log in from the user icon in the header, or open https://mangcoding-store-seven.vercel.app/?auth=login

### What you can try now

| Where | What to check |
|---|---|
| Home `/` | Hero banner (desktop and mobile — resize the window) |
| Home — "Our Best Seller" | Category tabs T-Shirt · Jacket · Shirt · Jeans (click, or arrow keys + Enter): T-Shirt shows 8 product cards, the other tabs show "No products in this category" (the mock data has T-shirts only). Grid: 4 columns on desktop, 3 on tablets, 2 on phones. "See More" opens the shop page (under development) |
| Product card heart | Logged in: saves / removes the product from your wishlist. Guest: opens Log In, and the product is saved after you log in |
| Product page — click a product card | Photo gallery (click a thumbnail; the 4th photo is in the sideways scroll strip), name, price "$40 USD", stock, choose color / size / quantity (quantity stays within stock). `/shop/unknown` shows "Product not found" with "Back to Home" |
| Product page — Add To Cart | Without a color: "Please select a color" (red frame around the colors). "Added to cart" and the cart icon count goes up — also without logging in (guests get their own cart in this browser). The heart saves the product (same state as on the product card); the bag button is decoration only |
| Product page — "Same Product" | Up to 8 other products of the same category, and "See More" (opens the shop page, under development) |
| Cart `/cart` (no login needed) | Add a product on its page, then open the cart: each row shows the photo, name, color and size, price and stock. "+" / "−" change the quantity (never above the stock) and the total updates at once; the trash icon removes the row ("Removed from cart"). The summary shows the number of products and the total; "Checkout" opens the checkout page. An empty cart shows "Your cart is empty" with "Shop Now". The stock shown is for display only — it is not reserved for you |
| Checkout `/checkout` (no login needed, cart not empty) | Shipping address (Province / City → Ward / Commune), payment method (Cash on delivery, bank transfer, or card — demo only, no real payment and no card details asked), order summary. Empty fields show messages. "Place Order" checks the cart again, saves the order and empties the cart. Guests start with empty fields; logged-in customers get their name and email filled in. If a guest cart is still waiting to move to an account, "Place Order" is turned off and a message explains to log in to that account |
| Order Success | After "Place Order": green check, "Order Placed Successfully!", order number, products, address, payment method and totals. "Continue Shopping" opens the shop page (under development). "View Order" opens the order history when logged in, or the guest order page `/order/<order number>` for a guest. An unknown order number, e.g. `/order-success/abc`, shows "Order not found" |
| Guest order `/order/<order number>` | "Order Details" with the order number, products, address, payment method and totals, and "Continue Shopping". Works only in the browser that placed the order (refresh keeps it). Another browser, or the same browser while logged in to an account, shows "Order not found". Demo only: the mock API keeps nothing private, so this is not a real privacy protection |
| Header | Logo, nav (Home · Shop · About Us · Contact), search bar with suggestions while typing (on phones: search button → full-screen search), mobile menu (☰) |
| Log In / Sign Up | Modal with two tabs, form validation (empty fields, wrong email, wrong password), toast after login |
| Logged in | User menu: Profile · Orders · Wishlist · Logout |
| Account pages `/account/profile`, `/account/orders`, `/account/wishlist` (log in first) | Account pages share the account menu: Profile · Orders · Wishlist. Links sit on top on phones and tablets and become a side menu on wide screens; the current page is highlighted |
| Profile `/account/profile` (log in first) | Your details filled in: full name, email (cannot be changed), phone, default address, date of birth. "Change photo" shows the new picture before you save (JPG, PNG or WebP, up to 1 MB). Save Changes → "Profile updated successfully" and the new name is used in the account menu |
| Change Password (on `/account/profile`, log in first) | Below your profile: current password, new password (at least 6 characters), confirm. A wrong current password, or a new password that is the same as the current one, shows a message under that field. Success → "Password changed successfully" and the form clears. On the demo, please change it back to the demo password afterwards |
| Order History `/account/orders` (log in first) | Your orders, newest first, 10 per page ("Previous page" / "Next page"; the page number stays in the address, so refresh keeps it). Each card shows the order number, date (dd/mm/yyyy), total, number of items and a colored status badge. "View Detail" opens the order in place: status steps (Ordered → Processing → Shipped → Delivered; hidden for a cancelled order), products, address, payment method and totals. No orders → "You have no orders yet" + Shop Now |
| Wishlist `/account/wishlist` (log in first) | Your saved products as cards, newest first. "Add to Cart" opens the product page to pick color and size; "Remove" takes the product off the list. Empty list → "No saved items" + Start Shopping |
| Search results `/search?q=shirt` | Press Enter in the search bar (or pick a category suggestion): "Results for "shirt"" with the number of items and the matching product cards, 8 per page ("Previous page" / "Next page"; the page number stays in the address). No match → "No results for '…'" with a tip to try another word. An empty search goes back to Home. The demo data has T-shirts only, so most words show the no-results message |
| Guest | Add to cart, open the cart, check out and see the order without an account. Heart / user icon → the login modal opens. Guest orders are not added to an account's order history |
| Footer | Links and "Log In" (hidden when logged in) |
| `/shop`, `/about`, `/contact` | "This page is under development" |
| Any unknown URL, e.g. `/abc` | 404 page |

All planned pages are built (Shop, About Us and Contact show "This page is under development" on purpose). The demo updates automatically after each merge into `practices-react-basic`.

### Demo limits

- The mock API runs on Render's free plan: after ~15 minutes without visits it sleeps, so the **first load can take 30–60 seconds**.
- Data **resets to the seed** whenever the API restarts — new accounts and changes are not kept.
- Login is a **UI simulation** on an open mock API. Do not use a real password.

---

## Features (MVP)

| Area | What users can do |
|------|-------------------|
| Home | Hero banner, "Best Seller" products with category tabs (T-Shirt · Jacket · Shirt · Jeans) |
| Product Detail | Image gallery, choose color / size / quantity, add to cart, add to wishlist, similar products |
| Search | Suggestions while typing + a full results page (`/search?q=`) |
| Auth | Log In / Sign Up in a **modal** (no separate pages). Opened with `?auth=login` in the URL |
| Cart | No login needed. Change quantity, remove items, live total. Saved on the server — per account, or per browser for a guest; logging in moves the guest cart into the account |
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
| `npm run start:server` | Start the mock API the same way as on Render (accepts request bodies up to 2 MB, needed for profile photos) |
| `npm run db:reset` | Reset mock API data to the seed |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run type-check` | Type-check app code (`tsconfig.app.json`) and config files (`tsconfig.node.json`) |
| `npm run lint` | Run ESLint on `src/` |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |

Before finishing any change, run `type-check`, `lint`, `test` and `build`.

---

## Deployment

| Part | Host | Settings |
|---|---|---|
| App | Vercel | Root Directory `react-training/practices-react-basic`, preset Vite, Node 22.x, Production Branch `practices-react-basic`, env `VITE_API_URL=https://long-le-internship.onrender.com` |
| Mock API (demo only) | Render (Free, Singapore) | Root Directory `react-training/practices-react-basic`, Branch `practices-react-basic`, Build `npm install`, Start `npm run start:server -- --host 0.0.0.0 --port $PORT`, env `NODE_VERSION=22` |

- Both deploy automatically on every push to `practices-react-basic`.
- `vercel.json`: SPA rewrite (direct links like `/shop` work), long cache for hashed `/assets/*`, basic security headers.
- `VITE_API_URL` is read at build time — after changing it, redeploy on Vercel.
- Switching to a real backend: change `VITE_API_URL` and the inside of `services/`; the UI stays the same.

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
- [x] Task breakdown
- [x] Services + hooks: products, auth, cart, wishlist, orders, search, profile
- [x] Shared UI: design tokens, UI atoms, modal, toast, loading / error / empty states, ProductCard
- [x] Layout: Header (desktop + mobile), Footer
- [x] Auth modal (Log In + Sign Up) + route guards
- [x] "Under development" pages + 404
- [x] Deploy demo: Vercel (app) + Render (mock API)
- [x] Home: Hero banner + Best Seller section
- [x] Product Detail: photo gallery, color / size / quantity, Add to Cart (also for guests), wishlist heart, "Same Product"
- [x] Cart: review items, change quantity, remove, order summary
- [x] Checkout form: shipping address (Province / City → Ward / Commune), payment method (mock), order summary — released together with Place Order
- [x] Place Order → Order Success
- [x] Guest checkout: buy without an account, guest order page in the same browser
- [x] Wishlist page: saved products, Remove, Add to Cart → product page
- [x] Order History: order cards, status badge, details in place, 10 per page
- [x] Profile: edit details, photo preview
- [x] Change password
- [x] Search: suggestions while typing + results page
- [x] Responsive pass: every screen checked on phone, tablet and desktop widths (320 → 1440), no sideways scrolling
- [x] Final check: full purchase flow, loading / error / empty states and keyboard use checked in the browser

---

## Notes

- Authentication is a **UI simulation** with mock data — it is not a real security mechanism.
- UI language: English.
