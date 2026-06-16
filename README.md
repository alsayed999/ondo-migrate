# Sei Network — Migration Invite Clone

Pixel-perfect React clone of [sei-network.vercel.app](https://sei-network.vercel.app/), built with Vite, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Stack

- **React 19** + **Vite**
- **Tailwind CSS v4**
- **shadcn/ui** (Button component with custom variants)
- **Inter** font (Google Fonts)

## Features

- Dark grid + radial background
- Three-step flow: Invite → Preparing network → Connect Wallet
- Access code copy with toast notification
- Animated transitions matching the original site

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── icons.tsx           # Sei logo, X, lock, check icons
│   ├── migration-invite.tsx # Main page component
│   └── ui/
│       └── button.tsx      # shadcn Button (custom styled)
├── lib/
│   └── utils.ts
├── App.tsx
├── index.css
└── main.tsx
```
