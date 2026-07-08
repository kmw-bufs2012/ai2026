import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "티타의 AI 2026 트렌드 연구소",
  description:
    "김덕진 《AI 2026 트렌드&활용백과》를 카드 + 퀴즈로 압축 학습. 발명가 소녀 티타와 자동인형 오르빌과 함께.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ef4444",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
