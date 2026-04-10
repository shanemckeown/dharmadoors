"use client";

import { useRouter } from "next/navigation";
import { MeditationTimer } from "@/components/MeditationTimer";

export default function SitPage() {
  const router = useRouter();

  return (
    <MeditationTimer
      onClose={() => router.push("/")}
    />
  );
}
