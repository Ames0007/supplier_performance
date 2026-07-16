"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Lang = "FR" | "EN";

/**
 * Bilingual FR/EN toggle (UX_FOUNDATIONS — FR primary). Phase 1 wires the
 * control + `lang` intent; the message catalog / i18n runtime is layered in
 * next. Default is FR.
 */
export function LangToggle() {
  const [lang, setLang] = React.useState<Lang>("FR");
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Changer la langue"
      onClick={() => setLang((current) => (current === "FR" ? "EN" : "FR"))}
    >
      {lang}
    </Button>
  );
}
