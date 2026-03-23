# CatGen UI

Frontend for CatGen — an AI-powered cat image generator. Browse the community gallery of AI-generated cats or generate your own renaissance portrait.

**Live demo:** https://cats-image-generator-ui.vercel.app
**Backend repo:** https://github.com/naccacheantoine/cats-image-generator

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite 7
- **Styling:** Custom CSS (no UI library)
- **Deployment:** Vercel

## Features

- **Gallery** — masonry grid of all community-generated cats, with hover overlay showing cat name, breed, and age
- **Generate** — authenticated users can generate one renaissance portrait cat per day; the AI picks a Met Museum painting and renders the cat in that painting's style
- **Auth** — signup/login with JWT stored in localStorage, passed as Bearer token to the API

## Getting Started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

### Environment Variables

```
VITE_API_URL=https://cats-image-generator.vercel.app
```

Without this variable the app falls back to `http://localhost:3000`.

## Project Structure

```
src/
  App.tsx              # router and global state (token, cats, active view)
  components/
    Navbar.tsx         # navigation and auth state display
    GalleryPage.tsx    # masonry cat gallery
    GeneratePage.tsx   # generation form and result display
    AuthPage.tsx       # login and signup forms
```
