"use client";

import { useCallback, useEffect, useState } from "react";
import { TOTAL_CHAPTERS } from "./chapters";

// 진도 / XP / 스트릭 / 뱃지 데이터 타입 정의
export interface ProgressState {
  studiedIds: number[]; // 학습 완료한 카드 id
  solvedIds: number[]; // 퀴즈 정답 처리된 카드 id
  xp: number; // 누적 XP
  streak: number; // 연속 학습일
  lastStudyDate: string; // 마지막 학습 날짜 (YYYY-MM-DD)
  badges: string[]; // 획득 뱃지 id 목록
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  desc: string;
}

export const BADGES: Badge[] = [
  { id: "first-note", label: "첫 발명 노트", emoji: "📓", desc: "첫 카드를 학습했다" },
  { id: "streak-3", label: "3일 연속", emoji: "🔥", desc: "3일 연속 학습 달성" },
  { id: "master-section", label: "한 장 마스터", emoji: "🏅", desc: "한 파트를 모두 학습" },
  { id: "clear-all", label: "전 챕터 클리어", emoji: "👑", desc: "모든 챕터를 학습 완료" },
];

const STORAGE_KEY = "tita-ai2026-progress-v1";
const XP_STUDY = 10; // 카드 학습 +10
const XP_QUIZ = 20; // 퀴즈 정답 +20

const emptyState: ProgressState = {
  studiedIds: [],
  solvedIds: [],
  xp: 0,
  streak: 0,
  lastStudyDate: "",
  badges: [],
};

// 로컬 날짜 문자열(YYYY-MM-DD)
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 두 날짜 문자열의 일수 차이
function dayDiff(fromStr: string, toStr: string): number {
  const from = new Date(fromStr + "T00:00:00");
  const to = new Date(toStr + "T00:00:00");
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// 누적 XP 기준 레벨 산출 (100 XP당 1레벨)
export function levelFromXp(xp: number): {
  level: number;
  intoLevel: number; // 현재 레벨에서 쌓은 XP
  needed: number; // 다음 레벨까지 필요한 총 XP
  ratio: number; // 0~1 진행 비율
} {
  const perLevel = 100;
  const level = Math.floor(xp / perLevel) + 1;
  const intoLevel = xp % perLevel;
  return {
    level,
    intoLevel,
    needed: perLevel,
    ratio: intoLevel / perLevel,
  };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(emptyState);
  const [loaded, setLoaded] = useState(false);

  // 마운트 이후에만 localStorage 접근 (SSR 안전)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProgressState>;
        setState({ ...emptyState, ...parsed });
      }
    } catch {
      // 읽기 실패 시 기본값 유지
    } finally {
      setLoaded(true);
    }
  }, []);

  // 상태 변경 시 저장
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패는 조용히 무시
    }
  }, [state, loaded]);

  // 스트릭 갱신 + 뱃지 재계산을 반영해 새 상태를 만든다
  const applyDailyAndBadges = useCallback((base: ProgressState): ProgressState => {
    const today = todayStr();
    let streak = base.streak;

    if (base.lastStudyDate !== today) {
      const diff = base.lastStudyDate ? dayDiff(base.lastStudyDate, today) : null;
      if (diff === 1) {
        streak = base.streak + 1; // 어제 학습 → 연속 유지
      } else {
        streak = 1; // 첫 학습이거나 하루 이상 공백 → 리셋
      }
    }

    const next: ProgressState = {
      ...base,
      streak,
      lastStudyDate: today,
    };

    // 뱃지 판정
    const earned = new Set(next.badges);
    if (next.studiedIds.length >= 1) earned.add("first-note");
    if (streak >= 3) earned.add("streak-3");
    if (next.studiedIds.length >= TOTAL_CHAPTERS) earned.add("clear-all");

    next.badges = Array.from(earned);
    return next;
  }, []);

  // 한 파트(섹션) 전체 학습 여부로 '한 장 마스터' 뱃지 부여
  const markSectionMaster = useCallback(
    (sectionIds: number[]) => {
      setState((prev) => {
        const done = sectionIds.every((id) => prev.studiedIds.includes(id));
        if (!done || prev.badges.includes("master-section")) return prev;
        return { ...prev, badges: [...prev.badges, "master-section"] };
      });
    },
    []
  );

  // 카드 학습 처리 (+10 XP, 중복 방지)
  const studyCard = useCallback(
    (id: number) => {
      setState((prev) => {
        if (prev.studiedIds.includes(id)) {
          // 이미 학습한 카드 → XP는 그대로, 스트릭만 갱신
          return applyDailyAndBadges(prev);
        }
        const base: ProgressState = {
          ...prev,
          studiedIds: [...prev.studiedIds, id],
          xp: prev.xp + XP_STUDY,
        };
        return applyDailyAndBadges(base);
      });
    },
    [applyDailyAndBadges]
  );

  // 퀴즈 정답 처리 (+20 XP, 중복 방지)
  const solveQuiz = useCallback(
    (id: number) => {
      setState((prev) => {
        if (prev.solvedIds.includes(id)) return prev;
        const base: ProgressState = {
          ...prev,
          solvedIds: [...prev.solvedIds, id],
          xp: prev.xp + XP_QUIZ,
        };
        return applyDailyAndBadges(base);
      });
    },
    [applyDailyAndBadges]
  );

  // 전체 초기화
  const reset = useCallback(() => {
    setState(emptyState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
  }, []);

  return {
    loaded,
    state,
    level: levelFromXp(state.xp),
    studyCard,
    solveQuiz,
    markSectionMaster,
    reset,
  };
}
