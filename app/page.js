"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  Settings2,
  BookOpen,
} from "lucide-react";

const JUZ_START = {
  1: [1, 1],
  2: [2, 142],
  3: [2, 253],
  4: [3, 93],
  5: [4, 24],
  6: [4, 148],
  7: [5, 82],
  8: [6, 111],
  9: [7, 88],
  10: [8, 41],
  11: [9, 93],
  12: [11, 6],
  13: [12, 53],
  14: [15, 1],
  15: [17, 1],
  16: [18, 75],
  17: [21, 1],
  18: [23, 1],
  19: [25, 21],
  20: [27, 56],
  21: [29, 46],
  22: [33, 31],
  23: [36, 28],
  24: [39, 32],
  25: [41, 47],
  26: [46, 1],
  27: [51, 31],
  28: [58, 1],
  29: [67, 1],
  30: [78, 1],
};

export default function Home() {
  const [quranData, setQuranData] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [currentPool, setCurrentPool] = useState([]);
  const [mode, setMode] = useState("juz");
  const [loading, setLoading] = useState(true);

  const [startJuz, setStartJuz] = useState(1);
  const [endJuz, setEndJuz] = useState(30);
  const [startSurah, setStartSurah] = useState(1);
  const [endSurah, setEndSurah] = useState(114);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/data/quran.json");
        const rawData = await response.json();
        const data = {};
        rawData.surahs.forEach((s) => {
          data[s.number] = {
            name: s.name,
            englishName: s.englishName,
            verses: s.ayahs,
          };
        });
        setQuranData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading Quran data:", error);
      }
    }
    fetchData();
  }, []);

  const getVersesInJuzRange = useCallback(
    (start, end) => {
      if (!quranData) return [];
      const verses = [];
      const actualStart = Math.min(start, end);
      const actualEnd = Math.max(start, end);

      for (let juz = actualStart; juz <= actualEnd; juz++) {
        const [sStart, aStart] = JUZ_START[juz];
        const sEnd = juz < 30 ? JUZ_START[juz + 1][0] : 114;
        const aEnd = juz < 30 ? JUZ_START[juz + 1][1] - 1 : 999;

        for (let s = sStart; s <= sEnd; s++) {
          const ayahs = quranData[s].verses;
          const startIdx = s === sStart ? aStart : 1;
          const endIdx = s === sEnd ? aEnd : ayahs.length;

          for (let a = startIdx; a <= Math.min(endIdx, ayahs.length); a++) {
            verses.push([s, a]);
          }
        }
      }
      return verses;
    },
    [quranData],
  );

  const getVersesInSurahRange = useCallback(
    (start, end) => {
      if (!quranData) return [];
      const verses = [];
      const actualStart = Math.min(start, end);
      const actualEnd = Math.max(start, end);

      for (let s = actualStart; s <= actualEnd; s++) {
        const ayahs = quranData[s].verses;
        for (let a = 1; a <= ayahs.length; a++) {
          verses.push([s, a]);
        }
      }
      return verses;
    },
    [quranData],
  );

  const generateSoal = useCallback(() => {
    let pool = [];
    if (mode === "juz") {
      pool = getVersesInJuzRange(startJuz, endJuz);
    } else {
      pool = getVersesInSurahRange(startSurah, endSurah);
    }

    if (pool.length === 0) return;

    setCurrentPool(pool);
    const randomIndex = Math.floor(Math.random() * pool.length);
    const [sNum, aNum] = pool[randomIndex];
    displayVerse(sNum, aNum, pool);
  }, [
    mode,
    startJuz,
    endJuz,
    startSurah,
    endSurah,
    getVersesInJuzRange,
    getVersesInSurahRange,
  ]);

  const displayVerse = (sNum, aNum, pool) => {
    const surah = quranData[sNum];
    const ayah = surah.verses[aNum - 1];
    setCurrentVerse({
      surahNum: sNum,
      ayahNum: aNum,
      text: ayah.text,
      surahName: surah.name,
      englishName: surah.englishName,
    });
  };

  const showNext = () => {
    if (!currentVerse || !currentPool.length) return;
    const idx = currentPool.findIndex(
      (v) => v[0] === currentVerse.surahNum && v[1] === currentVerse.ayahNum,
    );
    if (idx < currentPool.length - 1) {
      const [s, a] = currentPool[idx + 1];
      displayVerse(s, a, currentPool);
    }
  };

  const showPrev = () => {
    if (!currentVerse || !currentPool.length) return;
    const idx = currentPool.findIndex(
      (v) => v[0] === currentVerse.surahNum && v[1] === currentVerse.ayahNum,
    );
    if (idx > 0) {
      const [s, a] = currentPool[idx - 1];
      displayVerse(s, a, currentPool);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        generateSoal();
      } else if (e.key === "ArrowRight") {
        showNext();
      } else if (e.key === "ArrowLeft") {
        showPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generateSoal, currentVerse, currentPool]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header-centered">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className=""
        >
          Sketsa Practice
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-2"
        >
          ts pmo gng
        </motion.p>
      </header>

      <div className="compact-app-layout">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="compact-sidebar"
        >
          <div className="sidebar-card">
            <div className="sidebar-header">
              <Settings2 size={18} className="text-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest">
                Setting
              </h2>
            </div>

            <div className="sidebar-content">
              <div className="sidebar-group">
                <label className="sidebar-label">Mode</label>
                <div className="compact-mode-toggle">
                  <button
                    onClick={() => setMode("juz")}
                    className={mode === "juz" ? "active" : ""}
                  >
                    Juz
                  </button>
                  <button
                    onClick={() => setMode("surah")}
                    className={mode === "surah" ? "active" : ""}
                  >
                    Surat
                  </button>
                </div>
              </div>

              <div className="sidebar-group">
                <label className="sidebar-label">Rentang</label>
                <div className="compact-select-stack">
                  {mode === "juz" ? (
                    <>
                      <select
                        value={startJuz}
                        onChange={(e) => setStartJuz(parseInt(e.target.value))}
                      >
                        {[...Array(30)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Juz {i + 1}
                          </option>
                        ))}
                      </select>
                      <select
                        value={endJuz}
                        onChange={(e) => setEndJuz(parseInt(e.target.value))}
                      >
                        {[...Array(30)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Juz {i + 1}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <select
                        value={startSurah}
                        onChange={(e) =>
                          setStartSurah(parseInt(e.target.value))
                        }
                      >
                        {Object.keys(quranData).map((num) => (
                          <option key={num} value={num}>
                            {num}. {quranData[num].englishName}
                          </option>
                        ))}
                      </select>
                      <select
                        value={endSurah}
                        onChange={(e) => setEndSurah(parseInt(e.target.value))}
                      >
                        {Object.keys(quranData).map((num) => (
                          <option key={num} value={num}>
                            {num}. {quranData[num].englishName}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={generateSoal}
                className="compact-generate-btn hide-mobile"
              >
                <Sparkles size={16} />
                Generate Soal
              </button>
            </div>

            <div className="sidebar-footer hide-mobile">
              <div className="hotkey-item">
                <kbd>Space</kbd> Baru
              </div>
              <div className="hotkey-item">
                <kbd>←</kbd> <kbd>→</kbd> Nav
              </div>
            </div>
          </div>
        </motion.aside>

        <main className="compact-main">
          <AnimatePresence mode="wait">
            {currentVerse ? (
              <motion.div
                key={`${currentVerse.surahNum}-${currentVerse.ayahNum}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="compact-verse-card"
              >
                <div className="compact-meta">
                  <span className="meta-text">{currentVerse.englishName}</span>
                  <span className="meta-dot">•</span>
                  <span className="meta-text">
                    {currentVerse.surahNum}:{currentVerse.ayahNum}
                  </span>
                  <span className="meta-dot hide-mobile">•</span>
                  <span className="meta-arabic hide-mobile">
                    {currentVerse.surahName}
                  </span>
                </div>

                <div className="compact-arabic-text">{currentVerse.text}</div>

                <div className="compact-nav-bar hide-mobile">
                  <button
                    onClick={showPrev}
                    disabled={
                      !currentVerse ||
                      currentPool.findIndex(
                        (v) =>
                          v[0] === currentVerse.surahNum &&
                          v[1] === currentVerse.ayahNum,
                      ) <= 0
                    }
                    className="nav-arrow-btn-premium"
                  >
                    <ChevronLeft size={20} />
                    <div className="btn-stack">
                      <span className="btn-label-small">Sebelumnya</span>
                      <span className="btn-label-main">
                        {(() => {
                          const idx = currentPool.findIndex(
                            (v) =>
                              v[0] === currentVerse.surahNum &&
                              v[1] === currentVerse.ayahNum,
                          );
                          if (idx > 0) {
                            const prev = currentPool[idx - 1];
                            return prev[0] !== currentVerse.surahNum
                              ? quranData[prev[0]].englishName
                              : "Ayat";
                          }
                          return "Ayat";
                        })()}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={showNext}
                    disabled={
                      !currentVerse ||
                      currentPool.findIndex(
                        (v) =>
                          v[0] === currentVerse.surahNum &&
                          v[1] === currentVerse.ayahNum,
                      ) >=
                        currentPool.length - 1
                    }
                    className="nav-arrow-btn-premium"
                  >
                    <div className="btn-stack text-right">
                      <span className="btn-label-small">Selanjutnya</span>
                      <span className="btn-label-main">
                        {(() => {
                          const idx = currentPool.findIndex(
                            (v) =>
                              v[0] === currentVerse.surahNum &&
                              v[1] === currentVerse.ayahNum,
                          );
                          if (idx < currentPool.length - 1) {
                            const next = currentPool[idx + 1];
                            return next[0] !== currentVerse.surahNum
                              ? quranData[next[0]].englishName
                              : "Ayat";
                          }
                          return "Ayat";
                        })()}
                      </span>
                    </div>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="compact-empty">
                <BookOpen
                  size={48}
                  strokeWidth={1}
                  className="text-slate-200 mb-4 mx-auto"
                />
                <p>Pilih rentang dan tekan Acak untuk memulai</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <div className="mobile-action-bar">
        <button
          onClick={showPrev}
          disabled={
            !currentVerse ||
            currentPool.findIndex(
              (v) =>
                v[0] === currentVerse.surahNum && v[1] === currentVerse.ayahNum,
            ) <= 0
          }
          className="mobile-nav-btn-premium"
        >
          <ChevronLeft size={20} />
          <div className="mobile-btn-info">
            <span className="info-small">Prev</span>
            <span className="info-main">
              {(() => {
                const idx = currentPool.findIndex(
                  (v) =>
                    v[0] === currentVerse.surahNum &&
                    v[1] === currentVerse.ayahNum,
                );
                if (idx > 0) {
                  const prev = currentPool[idx - 1];
                  return prev[0] !== currentVerse.surahNum
                    ? quranData[prev[0]].englishName
                    : "Ayat";
                }
                return "Ayat";
              })()}
            </span>
          </div>
        </button>

        <button onClick={generateSoal} className="mobile-center-btn">
          <div className="btn-inner">
            <RefreshCcw size={24} />
          </div>
          <span>Acak</span>
        </button>

        <button
          onClick={showNext}
          disabled={
            !currentVerse ||
            currentPool.findIndex(
              (v) =>
                v[0] === currentVerse.surahNum && v[1] === currentVerse.ayahNum,
            ) >=
              currentPool.length - 1
          }
          className="mobile-nav-btn-premium"
        >
          <div className="mobile-btn-info text-right">
            <span className="info-small">Next</span>
            <span className="info-main">
              {(() => {
                const idx = currentPool.findIndex(
                  (v) =>
                    v[0] === currentVerse.surahNum &&
                    v[1] === currentVerse.ayahNum,
                );
                if (idx < currentPool.length - 1) {
                  const next = currentPool[idx + 1];
                  return next[0] !== currentVerse.surahNum
                    ? quranData[next[0]].englishName
                    : "Ayat";
                }
                return "Ayat";
              })()}
            </span>
          </div>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
