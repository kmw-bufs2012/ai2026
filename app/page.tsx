"use client";

import { useMemo, useState } from "react";
import { chapters, TOTAL_CHAPTERS } from "@/lib/chapters";
import type { ChapterSection } from "@/lib/chapters";
import { useProgress } from "@/lib/useProgress";
import GamifyBar from "@/components/GamifyBar";
import ChapterCard from "@/components/ChapterCard";

const SECTIONS: ChapterSection[] = ["트렌드 키워드 10", "범용 AI 3종 마스터"];

export default function Home() {
  const { loaded, state, level, studyCard, solveQuiz, markSectionMaster, reset } =
    useProgress();
  const [filter, setFilter] = useState<"전체" | ChapterSection>("전체");

  const visibleChapters = useMemo(() => {
    if (filter === "전체") return chapters;
    return chapters.filter((c) => c.section === filter);
  }, [filter]);

  function handleStudy(id: number) {
    studyCard(id);
    // 해당 파트 전체 학습 시 '한 장 마스터' 뱃지 판정
    const chapter = chapters.find((c) => c.id === id);
    if (chapter) {
      const sectionIds = chapters
        .filter((c) => c.section === chapter.section)
        .map((c) => c.id);
      markSectionMaster(sectionIds);
    }
  }

  // SSR/하이드레이션 안전: 로컬 데이터 로드 전에는 게이지를 0으로 표시
  const studiedCount = loaded ? state.studiedIds.length : 0;

  return (
    <div className="min-h-screen">
      <GamifyBar
        state={state}
        level={level}
        studiedCount={studiedCount}
        total={TOTAL_CHAPTERS}
      />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-5">
        {/* 히어로 */}
        <section className="mb-6 rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-500 to-pink-400 p-5 text-white sm:p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-200">
            티타 & 오르빌의 연구소
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
            AI 2026 트렌드 연구소
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-red-50 sm:text-base">
            김덕진 《AI 2026 트렌드&활용백과》의 핵심을 카드 한 장 = 개념 하나로
            압축했다. 발명 노트를 펼치고, 오르빌의 브리핑을 읽고, 시험대를
            통과하라. 뒤처질 시간 없다.
          </p>
        </section>

        {/* 파트 필터 */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(["전체", ...SECTIONS] as const).map((tab) => {
            const active = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`min-h-[44px] rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-stone-200 bg-white text-stone-600 active:bg-stone-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 카드 리스트 */}
        <div className="flex flex-col gap-4">
          {visibleChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              studied={state.studiedIds.includes(chapter.id)}
              solved={state.solvedIds.includes(chapter.id)}
              onStudy={handleStudy}
              onSolve={solveQuiz}
            />
          ))}
        </div>

        {/* 초기화 */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm("학습 진도·XP·뱃지를 모두 초기화할까요?")
              ) {
                reset();
                setFilter("전체");
              }
            }}
            className="min-h-[44px] rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-500 active:bg-stone-100"
          >
            학습 기록 초기화
          </button>
        </div>

        <footer className="mt-8 text-center text-xs leading-relaxed text-stone-400">
          원작: 김덕진 《AI 2026 트렌드&활용백과》 (스마트북스, 2025.10) ·
          <br />본 앱은 학습용 요약이며 원서 정독을 대체하지 않습니다.
        </footer>
      </main>
    </div>
  );
}
