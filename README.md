[README.md](https://github.com/user-attachments/files/26326785/README.md)
# PlugMarket.eu — EV Marketplace

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`
[README.md](https://github.com/user-attachments/files/26326905/README.md)# PlugMarket.eu — EV Marketplace

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Project Structure

```
src/
├── main.jsx                    # Entry point + React Router config
├── index.css                   # Global CSS reset
├── styles/
│   └── theme.js                # Shared design tokens (BC, GR, theme(), cs())
├── components/
│   ├── Icons.jsx               # All shared SVG icon components
│   ├── BNav.jsx                # Bottom navigation (React Router aware)
│   ├── Header.jsx              # Fixed top header with back navigation
│   └── Layout.jsx              # Page wrapper (Header + content + BNav)
└── pages/
    ├── HomePage.jsx            # ⚠️  Placeholder — migrate from ev-homepage.tsx
    ├── SearchPage.jsx          # ⚠️  Placeholder — migrate from ev-homepage.tsx (SearchPage)
    ├── SellPage.jsx            # ⚠️  Placeholder — migrate from ev-sell-page.jsx
    ├── FavouritesPage.jsx      # ⚠️  Placeholder — migrate from ev-homepage.tsx (FavsPage)
    ├── MessagesPage.jsx        # ⚠️  Placeholder — migrate from ev-messages.jsx
    ├── AccountPage.jsx         # ✅  Complete — all sub-pages included
    └── ListingDetailPage.jsx   # ⚠️  Placeholder — migrate from ev-listing-detail.jsx
```

## Routes

| Path             | Page              | Status      |
|------------------|-------------------|-------------|
| `/`              | Homepage          | Placeholder |
| `/search`        | Search & Filter   | Placeholder |
| `/sell`          | Sell Your EV      | Placeholder |
| `/favourites`    | Saved Vehicles    | Placeholder |
| `/messages`      | Messages          | Placeholder |
| `/account/*`     | My Account        | ✅ Complete |
| `/listing/:id`   | Listing Detail    | Placeholder |

## Design System

All tokens are in `src/styles/theme.js`:

- **Brand**: `BC = "#FF7500"`, `GR = "linear-gradient(135deg,#FF7500,#FF9533)"`
- **Dark mode**: `bg: #131319`, `card: #212128`, `nav: #131319`
- **Light mode**: `bg: #ffffff`, `card: #ffffff`, `nav: #ffffff`
- **Layout**: `maxWidth: 700`, `padding: "0 6%"`
- **Card helper**: `cs(t)` returns `{ background, borderRadius: 16, boxShadow, border }`

## Migrating Pages

Each placeholder page uses `useOutletContext()` to get the theme:

```jsx
import { useOutletContext } from "react-router-dom";

export default function MyPage() {
  const { t, dark, setDark } = useOutletContext();
  // t = theme object, dark = boolean, setDark = setter
  return <div>...</div>;
}
```

To migrate a page from an artifact file:
1. Remove standalone theme/dark mode/BNav/header code
2. Import shared tokens: `import { BC, GR, cs } from "../styles/theme"`
3. Import icons from: `import { Car, Bolt, ... } from "../components/Icons"`
4. Use `useOutletContext()` for theme access
5. Return just the page content (Layout handles header + nav)

## Deploy

```bash
npm run build     # Output in dist/
```

Deploy `dist/` to Netlify, Vercel, or any static host.
For Netlify, add a `_redirects` file in `public/`:
```
/*    /index.html   200
```


## Project Structure

```
src/
├── main.jsx                    # Entry point + React Router config
├── index.css                   # Global CSS reset
├── styles/
│   └── theme.js                # Shared design tokens (BC, GR, theme(), cs())
├── components/
│   ├── Icons.jsx               # All shared SVG icon components
│   ├── BNav.jsx                # Bottom navigation (React Router aware)
│   ├── Header.jsx              # Fixed top header with back navigation
│   └── Layout.jsx              # Page wrapper (Header + content + BNav)
└── pages/
    ├── HomePage.jsx            # ⚠️  Placeholder — migrate from ev-homepage.tsx[README.md](https://github.com/user-attachments/files/26326896/README.md)# PlugMarket.eu — EV Marketplace

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Project Structure

```
src/
├── main.jsx                    # Entry point + React Router config
├── index.css                   # Global CSS reset
├── styles/
│   └── theme.js                # Shared design tokens (BC, GR, theme(), cs())
├── components/
│   ├── Icons.jsx               # All shared SVG icon components
│   ├── BNav.jsx                # Bottom navigation (React Router aware)
│   ├── Header.jsx              # Fixed top header with back navigation
│   └── Layout.jsx              # Page wrapper (Header + content + BNav)
└── pages/
    ├── HomePage.jsx            # ⚠️  Placeholder — migrate from ev-homepage.tsx
    ├── SearchPage.jsx          # ⚠️  Placeholder — migrate from ev-homepage.tsx (SearchPage)
    ├── SellPage.jsx            # ⚠️  Placeholder — migrate from ev-sell-page.jsx
    ├── FavouritesPage.jsx      # ⚠️  Placeholder — migrate from ev-homepage.tsx (FavsPage)
    ├── MessagesPage.jsx        # ⚠️  Placeholder — migrate from ev-messages.jsx
    ├── AccountPage.jsx         # ✅  Complete — all sub-pages included
    └── ListingDetailPage.jsx   # ⚠️  Placeholder — migrate from ev-listing-detail.jsx
```

## Routes

| Path             | Page              | Status      |
|------------------|-------------------|-------------|
| `/`              | Homepage          | Placeholder |
| `/search`        | Search & Filter   | Placeholder |
| `/sell`          | Sell Your EV      | Placeholder |
| `/favourites`    | Saved Vehicles    | Placeholder |
| `/messages`      | Messages          | Placeholder |
| `/account/*`     | My Account        | ✅ Complete |
| `/listing/:id`   | Listing Detail    | Placeholder |

## Design System

All tokens are in `src/styles/theme.js`:

- **Brand**: `BC = "#FF7500"`, `GR = "linear-gradient(135deg,#FF7500,#FF9533)"`
- **Dark mode**: `bg: #131319`, `card: #212128`, `nav: #131319`
- **Light mode**: `bg: #ffffff`, `card: #ffffff`, `nav: #ffffff`
- **Layout**: `maxWidth: 700`, `padding: "0 6%"`
- **Card helper**: `cs(t)` returns `{ background, borderRadius: 16, boxShadow, border }`

## Migrating Pages

Each placeholder page uses `useOutletContext()` to get the theme:

```jsx
import { useOutletContext } from "react-router-dom";

export default function MyPage() {
  const { t, dark, setDark } = useOutletContext();
  // t = theme object, dark = boolean, setDark = setter
  return <div>...</div>;
}
```

To migrate a page from an artifact file:
1. Remove standalone theme/dark mode/BNav/header code
2. Import shared tokens: `import { BC, GR, cs } from "../styles/theme"`
3. Import icons from: `import { Car, Bolt, ... } from "../components/Icons"`
4. Use `useOutletContext()` for theme access
5. Return just the page content (Layout handles header + nav)

## Deploy

```bash
npm run build     # Output in dist/
```

Deploy `dist/` to Netlify, Vercel, or any static host.
For Netlify, add a `_redirects` file in `public/`:
```
/*    /index.html   200
```


    ├── SearchPage.jsx          # ⚠️  Placeholder — migrate from ev-homepage.tsx (SearchPage)
    ├── SellPage.jsx            # ⚠️  Placeholder — migrate from ev-sell-page.jsx
    ├── FavouritesPage.jsx      # ⚠️  Placeholder — migrate from ev-homepage.tsx (FavsPage)
    ├── MessagesPage.jsx        # ⚠️  Placeholder — migrate from ev-messages.jsx
    ├── AccountPage.jsx         # ✅  Complete — all sub-pages included
    └── ListingDetailPage.jsx   # ⚠️  Placeholder — migrate from ev-listing-detail.jsx
```

## Routes

| Path             | Page              | Status      |
|------------------|-------------------|-------------|
| `/`              | Homepage          | Placeholder |
| `/search`        | Search & Filter   | Placeholder |
| `/sell`          | Sell Your EV      | Placeholder |
| `/favourites`    | Saved Vehicles    | Placeholder |
| `/messages`      | Messages          | Placeholder |
| `/account/*`     | My Account        | ✅ Complete |
| `/listing/:id`   | Listing Detail    | Placeholder |

## Design System

All tokens are in `src/styles/theme.js`:

- **Brand**: `BC = "#FF7500"`, `GR = "linear-gradient(135deg,#FF7500,#FF9533)"`
- **Dark mode**: `bg: #131319`, `card: #212128`, `nav: #131319`
- **Light mode**: `bg: #ffffff`, `card: #ffffff`, `nav: #ffffff`
- **Layout**: `maxWidth: 700`, `padding: "0 6%"`
- **Card helper**: `cs(t)` returns `{ background, borderRadius: 16, boxShadow, border }`

## Migrating Pages

Each placeholder page uses `useOutletContext()` to get the theme:

```jsx
import { useOutletContext } from "react-router-dom";

export default function MyPage() {
  const { t, dark, setDark } = useOutletContext();
  // t = theme object, dark = boolean, setDark = setter
  return <div>...</div>;
}
```

To migrate a page from an artifact file:
1. Remove standalone theme/dark mode/BNav/header code
2. Import shared tokens: `import { BC, GR, cs } from "../styles/theme"`
3. Import icons from: `import { Car, Bolt, ... } from "../components/Icons"`
4. Use `useOutletContext()` for theme access
5. Return just the page content (Layout handles header + nav)

## Deploy

```bash
npm run build     # Output in dist/
```

Deploy `dist/` to Netlify, Vercel, or any static host.
For Netlify, add a `_redirects` file in `public/`:
```
/*    /index.html   200
```
