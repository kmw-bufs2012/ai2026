"use client";

import { BADGES } from "@/lib/useProgress";
import type { ProgressState } from "@/lib/useProgress";

interface GamifyBarProps {
  state: ProgressState;
  level: { level: number; intoLevel: number; needed: number; ratio: number };
  studiedCount: number;
  total: number;
}

// 상단 게이미피케이션 바 — 레벨/XP/스트릭/진행 게이지/뱃지
export default function GamifyBar({
  state,
  level,
  studiedCount,
  total,
}: GamifyBarProps) {
  const progressPct = total > 0 ? Math.round((studiedCount / total) * 100) : 0;

  return (
    <div className="sticky top-0 z-20 border-b-2 border-red-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3">
        {/* 상단 스탯 라인 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
          <span className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-stone-900">
            <span aria-hidden>⚙️</span> Lv.{level.level}
          </span>
          <span className="flex items-center gap-1.5 text-red-600">
            <span aria-hidden>✨</span> {state.xp} XP
          </span>
          <span className="flex items-center gap-1.5 text-stone-800">
            <span aria-hidden>🔥</span> {state.streak}일 연속
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-stone-800">
            <span aria-hidden>📚</span> {studiedCount}/{total}
          </span>
        </div>

        {/* 레벨 진행 게이지 */}
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-stone-500">
            <span>다음 레벨까지</span>
            <span>
              {level.intoLevel}/{level.needed} XP
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500"
              style={{ width: `${Math.round(level.ratio * 100)}%` }}
            />
          </div>
        </div>

        {/* 전체 학습 진행 게이지 */}
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-stone-500">
            <span>전체 진행률</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-red-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 뱃지 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {BADGES.map((badge) => {
            const owned = state.badges.includes(badge.id);
            return (
              <span
                key={badge.id}
                title={badge.desc}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  owned
                    ? "border-amber-400 bg-amber-50 text-stone-800"
                    : "border-stone-200 bg-stone-50 text-stone-300"
                }`}
              >
                <span aria-hidden className={owned ? "" : "grayscale"}>
                  {badge.emoji}
                </span>
                {badge.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
