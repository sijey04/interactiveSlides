import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Slide configuration — add more slides here
   ───────────────────────────────────────────── */
const SLIDES = [
  { secret: "running",     video: "/1.mp4", question: "What are the boys doing?" },
  { secret: "eating",  video: "/3.mp4", question: "What are the children doing?" },
  { secret: "singing",  video: "/4.mp4", question: "What is the girl doing?" },
  { secret: "climbing", video: "/5.mp4", question: "What is the boy doing?" },
  { secret: "dancing",  video: "/6.mp4", question: "What is the girl doing?" },
];

export default function App() {
  const [slideIndex, setSlideIndex] = useState(0);   // which slide we're on
  const [progress,   setProgress]   = useState([]);   // letters typed so far
  const [phase,      setPhase]      = useState("idle"); // idle | playing | ended(final)
  const videoRef = useRef(null);

  const currentSlide  = SLIDES[slideIndex];
  const secretLetters = currentSlide.secret.split("");
  const isLastSlide   = slideIndex === SLIDES.length - 1;

  /* ── Key listener — active only while idle ── */
  const handleKey = useCallback(
    (e) => {
      if (phase !== "idle") return;
      const key  = e.key.toLowerCase();
      const next = [...progress, key];

      const matches = next.every((ch, i) => ch === secretLetters[i]);
      if (!matches) { setProgress([]); return; }

      if (next.length === secretLetters.length) {
        setProgress(next);
        setPhase("playing");
      } else {
        setProgress(next);
      }
    },
    [phase, progress, secretLetters]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* ── Play video when phase → "playing" ── */
  useEffect(() => {
    if (phase === "playing" && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [phase, slideIndex]);

  /* ── Video ended ── */
  const handleVideoEnd = () => {
    if (isLastSlide) {
      setPhase("ended"); // final screen
    } else {
      // Advance to next slide
      setSlideIndex((i) => i + 1);
      setProgress([]);
      setPhase("idle");
    }
  };

  /* ── Restart everything from slide 0 ── */
  const restart = () => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    setSlideIndex(0);
    setProgress([]);
    setPhase("idle");
  };

  const isIdle  = phase === "idle";
  const isEnded = phase === "ended";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans text-white select-none">

      {/* ══════════════════════════════════════
          FULLSCREEN VIDEO — swaps src per slide
          ══════════════════════════════════════ */}
      <video
        ref={videoRef}
        key={currentSlide.video}   /* remount when src changes */
        src={currentSlide.video}
        onEnded={handleVideoEnd}
        playsInline
        preload="auto"
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
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <motion.h1
                  className="text-lg font-bold tracking-tight text-white"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentSlide.question}
                </motion.h1>

                <motion.p
                  className="max-w-sm text-xs text-white"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Type the answer to play the video.
                </motion.p>
                <motion.div
                  className="flex gap-2"
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {secretLetters.map((letter, i) => {
                    const filled = i < progress.length;
                    return (
                      <motion.div
                        key={i}
                        animate={filled ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold uppercase transition-all duration-200 ${
                          filled
                            ? "border-orange-400 bg-orange-400/20 text-orange-300 shadow-lg shadow-orange-500/20"
                            : "border-white/10 bg-white/5 text-white/60"
                        }`}
                      >
                        {filled ? progress[i] : "?"}
                      </motion.div>
                    );
                  })}
                </motion.div>
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

    </div>
  );
}

