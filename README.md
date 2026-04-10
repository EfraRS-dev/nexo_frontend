# Nexo Frontend

Web frontend for the Nexo ordering platform — a WhatsApp-based food ordering system powered by an AI agent backend.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Package Manager | pnpm |

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```bash
app/
  layout.tsx      # Root layout — fonts, global providers, metadata
  page.tsx        # Home page
  globals.css     # Tailwind base styles + CSS custom properties
public/           # Static assets
```
