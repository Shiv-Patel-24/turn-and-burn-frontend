# Turn and Burn – Car Rental (React frontend)

React implementation of every screen in the Figma file **"Turn and Burn (Car Rental) Copy"** — guest (logged out), guest (logged in) and host flows, plus all popups.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Open **`#/screens`** for a clickable index of every screen.

## Stack

- React 19 + Vite
- `react-icons` for icons
- A tiny hash router in `src/router.jsx` (no extra dependency; works on any static host). Swap for `react-router-dom` if you prefer.
- Plain CSS in `src/styles.css` (design tokens at the top). Fonts: Figtree, Inter, Poppins, Plus Jakarta Sans (Google Fonts, loaded in `index.html`).
- Images exported from the Figma file live in `public/images/`.

## Screen → route map

| Figma frame | Route |
|---|---|
| 1 Home (guest) | `#/` |
| 2 About · 3 Contact · 4 Terms · 21 Blogs | `#/about` `#/contact` `#/terms` `#/blogs` |
| 5 Car detail (guest) | `#/car/1` |
| 6 Home (logged in) | `#/app` |
| 7 Car listing + filters | `#/app/cars` |
| 8 Car detail (logged in) | `#/app/car/1` |
| 9 / 10 / 11 / 22 About, Contact, Terms, Blogs (logged in) | `#/app/about` … |
| 12 Booking / checkout | `#/app/book` |
| 13 Booking details | `#/app/booking-confirmed` |
| 14 My bookings | `#/app/bookings` |
| 15 Favorites | `#/app/favorites` |
| 16 Inbox | `#/app/inbox` |
| 17 Saved locations | `#/app/saved-locations` |
| 18 Legal | `#/app/legal` |
| 19 Profile | `#/app/profile` |
| 20 Payment history | `#/app/payments` |
| 30 Gift cards | `#/app/gift-cards` |
| 23 Host landing | `#/host` |
| 24–39 List your car (14 steps) | `#/host/list/location` … `#/host/list/acknowledgment` |
| 40 Calendar | `#/host/calendar` |
| 41 / 42 Trips booked + drawer | `#/host/trips` |
| 43 / 44 Trips history + drawer | `#/host/trips/history` |
| 45 Inbox | `#/host/inbox` |
| 46 Vehicles | `#/host/vehicles` |
| 66–74 Vehicle settings (9 tabs) | `#/host/vehicles/1/location` … `/pricing` |
| 47 Analytics | `#/host/analytics` |
| 48 More (Contact + FAQ) | `#/host/more` |
| 49 / 50 / 52 About, Terms, Blogs (host) | `#/host/about` … |
| 53 Profile (host) | `#/host/profile` |

**Popups** (open from the screens, wired as in the Figma prototype): Sign up, Log in, Forget password, OTP · user & host side menus · Log-out confirm · two-month date-range calendar · Rental info / QR payment · booking & gift-card payment success · Add review & ratings · Add/edit saved location (map) · Gift-card payment · Sort by / Listing status / Trip status / Vehicle filters · vehicle status kebab menu · booked-trip & trip-history drawers · file upload dialog · Add custom location · address autocomplete and dropdown states.

## Structure

```
src/
  App.jsx               routes + global modals + #/screens index
  router.jsx            minimal hash router
  ui.jsx                Modal, Field, Input, Select, Checkbox, Radio, Toggle, Stars, Popover
  data.js               mock data (cars, posts, chats, vehicles)
  components/           Layout (header/footer/menus), Search, Cards, AuthModals
  pages/                Home, InfoPages, CarDetail, Inbox
  pages/user/           Listing, Booking, Account
  pages/host/           HostLanding, Onboarding, Dashboard, VehicleEdit, Analytics, HostShared
```

All data is mock data in `src/data.js`; forms are interactive in the UI but not connected to a backend.
