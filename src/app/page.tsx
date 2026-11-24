import { Suspense } from "react";
import { HomeRack } from "@/components/seydehwon/home-rack";

export default function HomePage() {
  return (
    <main className="min-h-full bg-sey-bg">
      <Suspense
        fallback={
          <div className="flex min-h-[100svh] items-center justify-center text-sey-muted">
            Loading store…
          </div>
        }
      >
        <HomeRack />
      </Suspense>
    </main>
  );
}
