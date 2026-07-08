"use client";

import { useState } from "react";
import type { Quiz as QuizData } from "@/lib/chapters";

interface QuizProps {
  quiz: QuizData;
  alreadySolved: boolean;
  onSolved: () => void;
}

// 티타의 시험대 — 챕터별 퀴즈
export default function Quiz({ quiz, alreadySolved, onSolved }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selected === quiz.answer;

  function handleSelect(option: string) {
    if (revealed) return; // 확인 후 재선택 방지
    setSelected(option);
  }

  function handleCheck() {
    if (selected === null) return;
    setRevealed(true);
    if (selected === quiz.answer && !alreadySolved) {
      onSolved(); // 첫 정답에만 XP 지급
    }
  }

  function handleRetry() {
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          ⚗️
        </span>
        <h3 className="text-base font-extrabold text-stone-900 sm:text-lg">
          티타의 시험대
        </h3>
        {alreadySolved && (
          <span className="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            정답 완료 ✓
          </span>
        )}
      </div>

      <p className="mb-4 text-base font-semibold leading-snug text-stone-800 sm:text-lg">
        {quiz.question}
      </p>

      <ul className="flex flex-col gap-2">
        {quiz.options.map((option) => {
          const chosen = selected === option;
          const isAnswer = option === quiz.answer;

          let tone =
            "border-stone-200 bg-stone-50 text-stone-800 active:bg-stone-100";
          if (revealed) {
            if (isAnswer) {
              tone = "border-emerald-500 bg-emerald-50 text-emerald-800";
            } else if (chosen && !isAnswer) {
              tone = "border-red-500 bg-red-50 text-red-700";
            } else {
              tone = "border-stone-200 bg-stone-50 text-stone-400";
            }
          } else if (chosen) {
            tone = "border-red-500 bg-red-50 text-red-700";
          }

          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                disabled={revealed}
                className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors sm:text-base ${tone}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                    chosen ? "border-current" : "border-stone-300"
                  }`}
                  aria-hidden
                >
                  {revealed && isAnswer ? "✓" : revealed && chosen ? "✕" : ""}
                </span>
                <span>{option}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4">
        {!revealed ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={selected === null}
            className="min-h-[48px] w-full rounded-xl bg-red-600 px-5 py-3 text-base font-extrabold text-white transition-colors active:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            정답 확인하기
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div
              className={`rounded-xl px-4 py-3 text-sm font-bold sm:text-base ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isCorrect
                ? "정답! 티타가 흡족한 눈으로 널 본다. (+20 XP)"
                : `아쉽다! 정답은 "${quiz.answer}" 야. 다시 도전!`}
            </div>
            {!isCorrect && (
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[48px] w-full rounded-xl border-2 border-red-500 px-5 py-3 text-base font-extrabold text-red-600 transition-colors active:bg-red-50"
              >
                다시 풀기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
