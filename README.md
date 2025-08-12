# Flip & Quiz

A colorful, responsive quiz built with Next.js and Tailwind CSS. Click cards to reveal questions; show answers; track progress. Includes a Wall of Shame for students who can’t answer.

## Features
- 3x4 grid of cards (1–12), randomized Q&A
- Phases:
	- Auth: Teacher enters password (see configuration)
	- Preview: Show all questions with a prep timer
	- Game: Click a card to reveal a question in an overlay
- In overlay: Show Answer or Can’t Answer
	- Can’t Answer: prompts for student name and locks the card
	- Done (after showing answer): locks the card
- Wall of Shame: Displays student name and the question below the teacher password (Auth phase)
- Progress tracker: Cards left counter
- Responsive design with vibrant gradients

## Configure
- Teacher password: set NEXT_PUBLIC_TEACHER_PASSWORD (default: `teacher`)
	- Windows PowerShell (current session only):
		```powershell
		$env:NEXT_PUBLIC_TEACHER_PASSWORD = "my-secret"; npm run dev
		```
	- For development persistence, create `.env.local` in project root:
		```env
		NEXT_PUBLIC_TEACHER_PASSWORD=my-secret
		```

## Edit Questions
Update the `QUESTIONS` array in `src/app/page.tsx`.

## Run locally

```powershell
npm install
npm run dev
```

Then open http://localhost:3000

## Build and run production

```powershell
npm run build
npm start
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
