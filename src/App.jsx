import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Slide configuration — add more slides here
   ───────────────────────────────────────────── */
const SLIDES = [
  { video: "/1.jpg", statement: "", isTama: false },
  { video: "/2.jpg", statement: "", isTama: false },
  { video: "/3.jpg", statement: "", isTama: true },
  { video: "/4.jpg", statement: "", isTama: false },
  { video: "/5.jpg", statement: "", isTama: true },
];

const CONFETTI_COLORS = ["#34d399", "#f472b6", "#f59e0b", "#60a5fa", "#f43f5e", "#facc15"];
const CONFETTI_PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 17) % 100,
  x: (i % 2 === 0 ? 1 : -1) * (20 + ((i * 11) % 70)),
  rotate: 90 + ((i * 29) % 220),
  delay: (i % 10) * 0.05,
  duration: 1.2 + ((i * 7) % 5) * 0.14,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}));

export default function App() {
  const [slideIndex, setSlideIndex] = useState(0);   // which slide we're on
  const [phase,      setPhase]      = useState("idle"); // idle | correct | playing | ended(final)
  const [feedback, setFeedback] = useState("");
  const feedbackTimerRef = useRef(null);

  const currentSlide = SLIDES[slideIndex];
  const isLastSlide = slideIndex === SLIDES.length - 1;
  const correctChoice = currentSlide.isTama ? "tama" : "mali";

  const handleChoice = (choice) => {
    if (phase !== "idle") return;

    if (choice === correctChoice) {
      setFeedback("");
      setPhase("correct");
      return;
    }

    setFeedback("wrong");
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback("");
      feedbackTimerRef.current = null;
    }, 900);
  };

  /* ── Play video when phase → "playing" ── */
  useEffect(() => {
    if (phase !== "correct") return;

    const timer = window.setTimeout(() => {
      setPhase("playing");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  /* ── Video ended ── */
  const handleVideoEnd = () => {
    if (isLastSlide) {
      setPhase("ended"); // final screen
    } else {
      // Advance to next slide
      setSlideIndex((i) => i + 1);
      setFeedback("");
      setPhase("idle");
    }
  };

  /* ── Restart everything from slide 0 ── */
  const restart = () => {
    setSlideIndex(0);
    setFeedback("");
    setPhase("idle");
  };

  const isIdle  = phase === "idle";
  const isCorrect = phase === "correct";
  const isEnded = phase === "ended";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans text-white select-none">

      {/* ══════════════════════════════════════
          FULLSCREEN IMAGE — swaps src per slide
          ══════════════════════════════════════ */}
      <img
        key={currentSlide.video}   /* remount when src changes */
        src={currentSlide.video}
        alt="Quiz slide"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ══════════════════════════════════════
          OVERLAY — idle prompt or final screen
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {(isIdle || isEnded) && (
          <motion.div
            key="overlay"
            className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >

            {/* ── IDLE: type the secret word ── */}
            {isIdle && (
              <motion.div
                key={`idle-${slideIndex}`}
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <motion.h1
                  className="text-5xl font-bold tracking-tight text-white"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Tama or Mali?
                </motion.h1>

                <motion.p
                  className="max-w-3xl text-center text-3xl text-white"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentSlide.statement}
                </motion.p>

                <motion.div
                  className="flex gap-4"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => handleChoice("tama")}
                    className="cursor-pointer rounded-full bg-emerald-500 px-10 py-4 text-xl font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
                  >
                    Tama
                  </button>
                  <button
                    onClick={() => handleChoice("mali")}
                    className="cursor-pointer rounded-full bg-rose-500 px-10 py-4 text-xl font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-500/30 transition-transform hover:scale-105"
                  >
                    Mali
                  </button>
                </motion.div>

                <AnimatePresence>
                  {feedback === "wrong" && (
                    <motion.p
                      className="text-xl font-semibold uppercase tracking-wide text-rose-300"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      Try again.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── ENDED: all slides done ── */}
            {isEnded && (
              <motion.div
                key="ended-content"
                className="flex flex-col items-center gap-4 pb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-4xl shadow-lg shadow-orange-500/30"
                >
                  🎉
                </motion.div>

                <motion.h1
                  className="text-2xl font-extrabold tracking-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  That's all, folks!
                </motion.h1>

                <motion.p
                  className="max-w-sm text-xs text-white"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  You've gone through all the slides.
                </motion.p>

                <motion.button
                  onClick={restart}
                  className="mt-1 cursor-pointer rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-orange-500/25"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Over
                </motion.button>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCorrect && (
          <motion.div
            key="correct"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 overflow-hidden bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-none absolute inset-0">
              {CONFETTI_PIECES.map((piece) => (
                <motion.span
                  key={piece.id}
                  className="absolute top-[-12%] block h-3 w-2 rounded-sm"
                  style={{ left: `${piece.left}%`, backgroundColor: piece.color }}
                  initial={{ y: "-10vh", x: 0, opacity: 0, rotate: 0 }}
                  animate={{ y: "110vh", x: piece.x, opacity: [0, 1, 1, 0], rotate: piece.rotate }}
                  transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
                />
              ))}
            </div>
            <motion.div
              className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-400/60 backdrop-blur-sm"
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: [0.4, 1.12, 1], rotate: [20, -10, 0], opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <motion.span
                className="text-7xl font-black text-emerald-300"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                ✓
              </motion.span>
            </motion.div>
            <motion.p
              className="text-3xl font-extrabold uppercase tracking-wide text-emerald-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              You are correct
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          SKIP button — visible while playing
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {phase === "playing" && (
          <motion.div
            key="skip"
            className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <button
              onClick={handleVideoEnd}
              className="cursor-pointer rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Skip ▸
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          ANSWER OVERLAY — shown while playing
          ══════════════════════════════════════ */}
      <AnimatePresence>
        {phase === "playing" && (
          <motion.div
            key="answer-overlay"
            className="absolute inset-x-0 bottom-20 z-20 flex flex-col items-center gap-2 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-xs text-white/70 uppercase tracking-widest font-medium">Answer</p>
            <motion.p
              className="text-7xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.4 }}
            >
              {currentSlide.isTama ? "Tama" : "Mali"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

