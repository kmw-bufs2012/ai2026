"use client";

import { useState } from "react";
import type { Chapter } from "@/lib/chapters";
import Quiz from "./Quiz";

type CardStatus = "미학습" | "학습중" | "완료";

interface ChapterCardProps {
  chapter: Chapter;
  studied: boolean;
  solved: boolean;
  onStudy: (id: number) => void;
  onSolve: (id: number) => void;
}

// 상태별 색상 구분 (미학습 / 학습중 / 완료)
const statusStyles: Record<CardStatus, string> = {
  미학습: "bg-stone-100 text-stone-500",
  학습중: "bg-pink-300 text-stone-900",
  완료: "bg-emerald-500 text-white",
};

export default function ChapterCard({
  chapter,
  studied,
  solved,
  onStudy,
  onSolve,
}: ChapterCardProps) {
  // 카드를 펼쳤는가(= 학습 시작). 완료된 카드는 기본 펼침.
  const [open, setOpen] = useState(false);

  const status: CardStatus =
    studied && solved ? "완료" : open || studied ? "학습중" : "미학습";

  function handleOpen() {
    setOpen(true);
    onStudy(chapter.id); // 펼치는 순간 학습 처리(+10 XP, 중복 방지)
  }

  const borderTone =
    status === "완료"
      ? "border-emerald-400"
      : status === "학습중"
      ? "border-pink-300"
      : "border-stone-200";

  return (
    <article
      className={`overflow-hidden rounded-3xl border-2 bg-white shadow-sm ${borderTone}`}
    >
      {/* 헤더: 발명 노트 제목 + 상태 */}
      <header className="flex items-start gap-3 border-b border-stone-100 bg-stone-50 p-4 sm:p-5">
        <span
          className="mt-0.5 text-2xl"
          aria-hidden
        >
          📓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">
            티타의 발명 노트 · {chapter.section}
          </p>
          <h2 className="mt-0.5 text-base font-extrabold leading-snug text-stone-900 sm:text-lg">
            {chapter.chapterTitle}
          </h2>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}
        >
          {status}
        </span>
      </header>

      {!open && !studied ? (
        // 접힌 상태: 다음 행동 버튼 1개만 크고 분명하게
        <div className="p-4 sm:p-5">
          <button
            type="button"
            onClick={handleOpen}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-base font-extrabold text-white transition-colors active:bg-red-700"
          >
            발명 노트 펼치기 <span aria-hidden>→</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          {/* 티타 리액션 */}
          <div className="rounded-2xl bg-red-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-red-600">
              <span aria-hidden>🎩</span> 티타
            </div>
            <p className="text-sm leading-relaxed text-stone-800 sm:text-base">
              {chapter.titaReaction}
            </p>
          </div>

          {/* 오르빌의 브리핑 — 핵심 3줄 */}
          <div className="rounded-2xl bg-stone-900 p-4 text-stone-50">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-amber-400">
              <span aria-hidden>🤖</span> 오르빌의 브리핑
            </div>
            <ul className="flex flex-col gap-2">
              {chapter.orbalBriefing.map((line, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-snug sm:text-base">
                  <span className="font-bold text-amber-400" aria-hidden>
                    {idx + 1}.
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 티타의 시험대 */}
          <Quiz
            quiz={chapter.quiz}
            alreadySolved={solved}
            onSolved={() => onSolve(chapter.id)}
          />
        </div>
      )}
    </article>
  );
}
