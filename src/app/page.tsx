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
  const [overlayStep, setOverlayStep] = useState<"question" | "answer">("question");
  const [phase, setPhase] = useState<"auth" | "preview" | "game">("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const TEACHER_PASSWORD = process.env.NEXT_PUBLIC_TEACHER_PASSWORD || "teacher";

  const [prepSeconds, setPrepSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [previewRunning, setPreviewRunning] = useState(false);

  const [wallOfShame, setWallOfShame] = useState<{ name: string; question: string }[]>([]);
  const [shameInput, setShameInput] = useState("");

  useEffect(() => {
    const assigned = shuffle(QUESTIONS).slice(0, 12);
    const init: Card[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      qa: assigned[i % assigned.length],
      stage: "initial",
      flipped: false,
    }));
    setCards(init);
    setRemaining(prepSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!previewRunning || phase !== "preview") return;
    if (remaining <= 0) {
      setPreviewRunning(false);
      setPhase("game");
      return;
    }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [previewRunning, remaining, phase]);

  const cardsLeft = useMemo(() => cards.filter((c) => c.stage !== "answered").length, [cards]);

  const onCardClick = (idx: number) => {
    if (phase !== "game") return;
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        if (c.stage !== "initial") return c;
        return { ...c, stage: "question", flipped: true };
      })
    );
  setActiveIdx(idx);
  setOverlayStep("question");
  };

  // Step 1: Reveal answer in the overlay (do not lock yet)
  const showAnswer = (idx: number | null) => {
    if (idx === null) return;
    setOverlayStep("answer");
  };

  // Step 2: Finalize and lock the card after showing the answer
  const finalizeAnswer = (idx: number | null) => {
    if (idx === null) return;
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        if (c.stage !== "question") return c;
        return { ...c, stage: "answered", flipped: false };
      })
    );
    setActiveIdx(null);
    setOverlayStep("question");
  };

  const addToWallOfShame = (name: string, idx: number | null) => {
    if (!name.trim()) return;
    const question = idx !== null && cards[idx] ? cards[idx].qa.q : "";
    setWallOfShame((prev) => [...prev, { name: name.trim(), question }]);
    finalizeAnswer(idx);
    setShameInput("");
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
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-primary">Flip & Quiz</h1>
          {phase === "game" && (
            <div className="rounded-full px-4 py-2 text-sm sm:text-base shadow-sm border border-secondary/40 bg-secondary/20 text-primary">
              Cards left: <span className="font-semibold">{cardsLeft}</span>/{cards.length}
            </div>
          )}
        </header>

        {phase === "auth" && (
          <section className="mt-10 mx-auto max-w-md rounded-2xl border border-secondary/40 bg-[color-mix(in_oklab,var(--color-bg),#ffffff_5%)] p-6 shadow">
            <h2 className="font-heading text-xl text-primary mb-3">Teacher Access</h2>
            <p className="text-sm text-secondary/80 mb-4">Enter the teacher password to start the preparation preview.</p>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (password === TEACHER_PASSWORD) {
                  setAuthError("");
                  setRemaining(prepSeconds);
                  setPhase("preview");
                } else {
                  setAuthError("Incorrect password");
                }
              }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-secondary/40 bg-[var(--color-bg)] px-3 py-2 text-primary placeholder:text-secondary/60 focus:outline-2 focus:outline-offset-2"
                style={{ outlineColor: "var(--color-accent)" }}
              />
              {authError && <div className="text-xs text-red-400">{authError}</div>}
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: "var(--color-accent)", outlineColor: "var(--color-accent)" }}
              >
                Continue
              </button>
            </form>

            {wallOfShame.length > 0 && (
              <div className="mt-8">
                <div className="font-heading text-base text-primary mb-2">Wall of Shame</div>
                <ul className="list-disc list-inside text-secondary/80 text-sm space-y-1">
                  {wallOfShame.map((entry, idx) => (
                    <li key={idx}>
                      <span className="font-medium text-primary">{entry.name}</span>
                      <span className="text-secondary/70"> — {entry.question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {phase === "preview" && (
          <section className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-xl text-primary">Preparation Preview</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-secondary/80">Time (sec)</label>
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={prepSeconds}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setPrepSeconds(v);
                    setRemaining(v);
                  }}
                  className="w-20 rounded-md border border-secondary/40 bg-[var(--color-bg)] px-2 py-1 text-primary focus:outline-2 focus:outline-offset-2"
                  style={{ outlineColor: "var(--color-accent)" }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-secondary/40 p-4">
              <div className="text-secondary/80 text-sm">All Questions</div>
              <ol className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 list-decimal list-inside">
                {cards.map((c) => (
                  <li key={c.id} className="text-primary">{c.qa.q}</li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-secondary/80">
                Time Remaining:
                <span className="ml-2 font-heading text-2xl text-primary tabular-nums">
                  {Math.floor(remaining / 60).toString().padStart(2, "0")}:{(remaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!previewRunning ? (
                  <button
                    type="button"
                    onClick={() => setPreviewRunning(true)}
                    className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ backgroundColor: "var(--color-accent)", outlineColor: "var(--color-accent)" }}
                  >
                    Start Prep Timer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreviewRunning(false)}
                    className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ backgroundColor: "var(--color-secondary)", outlineColor: "var(--color-secondary)" }}
                  >
                    Pause
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {phase === "game" && (
          <main className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card, idx) => {
              const disabled = card.stage === "answered";
              const gradient = colorSets[idx % colorSets.length];
              return (
                <div
                  key={card.id}
                  className={`perspective group relative aspect-square w-full max-w-36 sm:max-w-40 md:max-w-44 mx-auto select-none focus:outline-none ${disabled ? "pointer-events-none opacity-60" : ""}`}
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
                    className={`card-3d relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${card.flipped && activeIdx === idx ? "[transform:rotateY(180deg)]" : ""}`}
                  >
                    <div
                      className={`absolute inset-0 backface-hidden rounded-xl shadow-lg border border-secondary/40 overflow-hidden ${card.stage === "answered" ? "bg-[var(--color-bg)]/80" : `bg-gradient-to-br ${gradient}`} flex items-center justify-center p-4`}
                    >
                      {card.stage === "answered" ? (
                        <div className="text-center">
                          <div className="text-xs uppercase tracking-wide text-secondary mb-2">Answer</div>
                          <div className="text-lg sm:text-xl font-semibold leading-snug text-primary break-words overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
                            {card.qa.a}
                          </div>
                        </div>
                      ) : (
                        <span className="text-5xl sm:text-6xl font-black text-[var(--color-bg)] drop-shadow">{card.id}</span>
                      )}
                    </div>

                    <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-xl shadow-lg border border-secondary/40 bg-[var(--color-bg)]/95 p-4 flex flex-col">
                      <div className="text-xs uppercase tracking-wide text-secondary">Question</div>
                      <div className="mt-2 text-base sm:text-lg font-medium flex-1 text-primary">{card.qa.q}</div>
                      {card.stage === "question" && <div className="mt-4 text-right text-secondary/70 text-xs">Open card to answer…</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </main>
        )}

        {phase === "game" && activeIdx !== null && cards[activeIdx]?.stage === "question" && (
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
              <div className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] [transform:rotateY(180deg)]`}>
                <div className="absolute inset-0 backface-hidden rounded-2xl shadow-xl border border-secondary/40 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center p-6">
                  <span className="text-6xl sm:text-7xl font-black text-[var(--color-bg)] drop-shadow">{cards[activeIdx].id}</span>
                </div>
                <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] rounded-2xl shadow-xl border border-secondary/40 bg-[var(--color-bg)] p-6 flex flex-col">
                  {overlayStep === "question" ? (
                    <>
                      <div className="font-heading text-secondary text-sm sm:text-base uppercase tracking-wide">Question</div>
                      <div className="mt-3 text-primary text-xl sm:text-2xl font-semibold leading-snug flex-1">{cards[activeIdx].qa.q}</div>
                      <form
                        className="mt-4 flex flex-col gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          addToWallOfShame(shameInput, activeIdx);
                        }}
                      >
                        <input
                          type="text"
                          value={shameInput}
                          onChange={(e) => setShameInput(e.target.value)}
                          placeholder="Student name"
                          className="rounded-md border border-secondary/40 px-2 py-2 text-sm text-primary bg-[var(--color-bg)] placeholder:text-secondary/60 focus:outline-2 focus:outline-offset-2"
                          style={{ outlineColor: "var(--color-accent)" }}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => showAnswer(activeIdx)}
                            className="inline-flex items-center rounded-xl px-4 py-2.5 text-base font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ backgroundColor: "var(--color-accent)", outlineColor: "var(--color-accent)" }}
                          >
                            Show Answer
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-xl px-4 py-2.5 text-base font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ backgroundColor: "#ef4444", outlineColor: "#ef4444" }}
                          >
                            Can&apos;t Answer
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <>
                      <div className="font-heading text-secondary text-sm sm:text-base uppercase tracking-wide">Answer</div>
                      <div className="mt-3 text-primary text-xl sm:text-2xl leading-relaxed flex-1 overflow-y-auto whitespace-pre-wrap break-words">{cards[activeIdx].qa.a}</div>
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => finalizeAnswer(activeIdx)}
                          className="inline-flex items-center rounded-xl px-4 py-2.5 text-base font-semibold text-[var(--color-bg)] shadow hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{ backgroundColor: "var(--color-primary)", outlineColor: "var(--color-primary)" }}
                        >
                          Done
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-secondary">
          {phase === "game"
            ? cardsLeft === 0
              ? "All cards answered! 🎉"
              : "Click a card to reveal a question."
            : phase === "preview"
            ? "Students: Review all questions. Timer will end soon."
            : "Teacher: Enter password to begin."}
        </footer>
      </div>
    </div>
  );
}
