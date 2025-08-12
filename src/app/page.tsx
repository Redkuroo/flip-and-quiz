"use client";

import { useEffect, useMemo, useState } from "react";

type QA = { q: string; a: string };
type Stage = "initial" | "question" | "answered";
type Card = {
  id: number;
  qa: QA;
  stage: Stage;
  flipped: boolean; // true => showing back
};

const QUESTIONS: QA[] = [
  { q: "What is Node.js in simple terms?", a: "A special “kitchen” where JavaScript can run outside the browser, allowing it to work on your computer or server." },
  { q: "Why does React Native need Node.js?", a: "To run the tools (like Metro bundler, npm/yarn, and CLI commands) that prepare and build your app before it runs on a phone." },
  { q: "What is Metro bundler’s job in React Native?", a: "To gather all your code files and combine them into one bundle your phone can understand." },
  { q: "What are npm and yarn used for in React Native development?", a: "They are package managers that download and manage libraries your app needs." },
  { q: "In React Native, what are CLI tools?", a: "Command-line programs that let you run tasks like starting the app or building it for Android/iOS." },
  { q: "What’s the difference between npm start --web and expo start --web?", a: "npm start --web runs the start script in package.json (which usually calls Expo), while expo start --web runs the Expo CLI directly." },
  { q: "In package.json, why do scripts say expo start instead of npm start?", a: "Because Expo is the tool that actually starts and manages the project; npm only triggers the script." },
  { q: "What does “JavaScript runtime outside the browser” mean?", a: "It means JavaScript can run in an environment like Node.js without needing a web browser." },
  { q: "What command checks your installed Node.js version?", a: "node -v" },
  { q: "What is the role of package.json in a Node.js or React Native project?", a: "It stores project metadata, scripts, and a list of dependencies." },
  { q: "What is the difference between dependencies and devDependencies in package.json?", a: "dependencies are needed for the app to run, while devDependencies are only needed for development." },
  { q: "What is npx used for in React Native development?", a: "It allows you to run commands from packages without installing them globally." },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const assigned = shuffle(QUESTIONS).slice(0, 12);
    const init: Card[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      qa: assigned[i % assigned.length],
      stage: "initial",
      flipped: false,
    }));
    setCards(init);
  }, []);

  const remaining = useMemo(() => cards.filter((c) => c.stage !== "answered").length, [cards]);

  const onCardClick = (idx: number) => {
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        if (c.stage !== "initial") return c; // only first click
        return { ...c, stage: "question", flipped: true };
      })
    );
    setActiveIdx(idx);
  };

  const showAnswer = (idx: number) => {
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        if (c.stage !== "question") return c;
        // Flip back and mark answered
        return { ...c, stage: "answered", flipped: false };
      })
    );
    setActiveIdx(null);
  };

  const colorSets = [
    "from-pink-500 to-rose-500",
    "from-orange-500 to-amber-500",
    "from-lime-500 to-green-500",
    "from-emerald-500 to-teal-500",
    "from-cyan-500 to-sky-500",
    "from-blue-500 to-indigo-500",
    "from-violet-500 to-fuchsia-500",
    "from-red-500 to-orange-500",
    "from-amber-500 to-lime-500",
  ];

  return (
    <div className="min-h-dvh w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Flip & Quiz
          </h1>
          <div className="rounded-full px-4 py-2 text-sm sm:text-base shadow-sm border border-secondary/40 bg-secondary/20 text-primary">
            Cards left: <span className="font-semibold">{remaining}</span>/9
          </div>
        </header>

        <main className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card, idx) => {
            const disabled = card.stage === "answered";
            const gradient = colorSets[idx % colorSets.length];
            return (
              <div
                key={card.id}
                className={`perspective group relative aspect-square w-full max-w-36 sm:max-w-40 md:max-w-44 mx-auto select-none focus:outline-none ${
                  disabled ? "pointer-events-none opacity-60" : ""
                }`}
                aria-label={`Card ${card.id}`}
                onClick={() => onCardClick(idx)}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCardClick(idx);
                  }
                }}
              >
                <div
                  className={`card-3d relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                    card.flipped && activeIdx === idx
                      ? "[transform:rotateY(180deg)]"
                      : ""
                  }`}
                >
                  {/* Front Face */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-xl shadow-lg border border-secondary/40 overflow-hidden ${
                      card.stage === "answered"
                        ? "bg-[var(--color-bg)]/80"
                        : `bg-gradient-to-br ${gradient}`
                    } flex items-center justify-center p-4`}
                  >
                    {card.stage === "answered" ? (
                      <div className="text-center">
                        <div className="text-xs uppercase tracking-wide text-secondary mb-2">Answer</div>
                        <div className="text-lg sm:text-xl font-semibold leading-snug text-primary">{card.qa.a}</div>
                      </div>
                    ) : (
                      <span className="text-5xl sm:text-6xl font-black text-[var(--color-bg)] drop-shadow">{card.id}</span>
                    )}
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-xl shadow-lg border border-secondary/40 bg-[var(--color-bg)]/95 p-4 flex flex-col">
                    <div className="text-xs uppercase tracking-wide text-secondary">Question</div>
                    <div className="mt-2 text-base sm:text-lg font-medium flex-1 text-primary">{card.qa.q}</div>
                    {card.stage === "question" && (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            showAnswer(idx);
                          }}
                          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{ backgroundColor: "var(--color-accent)", outlineColor: "var(--color-accent)" }}
                        >
                          Show Answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* Centered enlarged overlay for active (question) card */}
        {activeIdx !== null && cards[activeIdx]?.stage === "question" && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveIdx(null)}
          >
            <div
              className="perspective group relative w-full max-w-md sm:max-w-lg md:max-w-xl aspect-[3/4] select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] [transform:rotateY(180deg)]`}
              >
                {/* Front (would be visible if rotated back) */}
                <div className="absolute inset-0 backface-hidden rounded-2xl shadow-xl border border-secondary/40 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center p-6">
                  <span className="text-6xl sm:text-7xl font-black text-[var(--color-bg)] drop-shadow">
                    {cards[activeIdx].id}
                  </span>
                </div>
                {/* Back with Question */}
                <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-2xl shadow-xl border border-secondary/40 bg-[var(--color-bg)] p-6 flex flex-col">
                  <div className="font-heading text-secondary text-sm sm:text-base uppercase tracking-wide">Question</div>
                  <div className="mt-3 text-primary text-xl sm:text-2xl font-semibold leading-snug flex-1">
                    {cards[activeIdx].qa.q}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => showAnswer(activeIdx)}
                      className="inline-flex items-center rounded-xl px-4 py-2.5 text-base font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ backgroundColor: "var(--color-accent)", outlineColor: "var(--color-accent)" }}
                    >
                      Show Answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-secondary">
          {remaining === 0 ? "All cards answered! 🎉" : "Click a card to reveal a question."}
        </footer>
      </div>
    </div>
  );
}
