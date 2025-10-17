"use client";

import { useCallback } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App({ initialMessage }: { initialMessage?: string } = {}) {
  // Default to light regardless of system preference
  const { scheme, setScheme } = useColorScheme("light");

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-end p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 text-center">
          <p className="text-base text-slate-700 subtitle-cursive">Tell me about your project and I’ll take it from here</p>
        </div>
        <ChatKitPanel
          theme={scheme}
          onWidgetAction={handleWidgetAction}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
          initialMessage={initialMessage}
        />
      </div>
    </main>
  );
}
