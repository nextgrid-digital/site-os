"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChatgptIcon, ClaudeIcon, CursorIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, MUTED, PANEL } from "./kit";

/**
 * Fix prompts: pick a model, see a shimmer while it "generates", then the prompt.
 * Dummy copy, no API. Click the prompt card to generate it again.
 */
const PROVIDERS = [
  {
    name: "Claude",
    icon: ClaudeIcon,
    text: "In the /pricing template, add one H1 that names the offer and the buyer it is for. Keep it under 70 characters.",
  },
  {
    name: "ChatGPT",
    icon: ChatgptIcon,
    text: "Add one H1 to /pricing that names the offer and the buyer. Reuse the hero offer name. Do not add new claims.",
  },
  {
    name: "Cursor",
    icon: CursorIcon,
    text: "Update /pricing: one H1 naming the offer and its buyer, matching the existing hero copy. Leave the layout unchanged.",
  },
];

function Shimmer() {
  return (
    <div className="flex flex-col gap-1.5" aria-label="Generating">
      {[100, 92, 60].map((w) => (
        <div
          key={w}
          className="relative h-2.5 overflow-hidden rounded bg-surface-4"
          style={{ width: `${w}%` }}
        >
          <motion.div
            className="absolute inset-0 [background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
        </div>
      ))}
    </div>
  );
}

/** Shows a shimmer for a moment, then the prompt. Remounted per model pick via `key`. */
function Generation({ provider }: { provider: (typeof PROVIDERS)[number] }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDone(true), 1100);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-medium">Missing H1 on /pricing</span>
        <span
          className={cn(
            "shrink-0 rounded-md border border-solid border-surface px-1.5 py-0.5 text-[0.6875rem]",
            MUTED,
          )}
        >
          {done ? provider.name : "Draft"}
        </span>
      </div>
      {done ? (
        <p className={cn("font-mono text-[0.6875rem] leading-4", MUTED)}>{provider.text}</p>
      ) : (
        <>
          <Shimmer />
          <p className={cn("mt-2 text-[0.6875rem]", MUTED)}>Generating with {provider.name}…</p>
        </>
      )}
    </>
  );
}

export const ProductFixPrompts = () => {
  const { ref, cycle, hold, bind } = useLoop(4800);
  // A pick only counts for the loop tick it was made in, so the loop takes over after idle.
  const [pick, setPick] = useState<{ cycle: number; index: number; run: number } | null>(null);
  const picked = pick && pick.cycle === cycle ? pick : null;
  const active = picked ? picked.index : cycle % PROVIDERS.length;
  const run = picked ? picked.run : 0;
  const provider = PROVIDERS[active];

  const choose = (index: number) => {
    hold();
    setPick({ cycle, index, run: (picked?.run ?? 0) + 1 });
  };

  return (
    <div ref={ref} {...bind} className={PANEL}>
      <div className="mb-2 flex gap-1" role="group" aria-label="Model">
        {PROVIDERS.map((p, i) => {
          const Icon = p.icon;
          const on = i === active;
          return (
            <button
              key={p.name}
              type="button"
              aria-pressed={on}
              onClick={() => choose(i)}
              className={cn(
                "flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border border-solid px-1.5 py-1 transition-colors",
                FOCUS,
                on
                  ? "border-primary bg-primary/10 text-primary"
                  : cn("border-surface hover:border-primary/60 hover:bg-primary/10 hover:text-primary", MUTED),
              )}
            >
              <Icon className="size-3" aria-hidden="true" />
              {p.name}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label={`Generate the ${provider.name} prompt again`}
        onClick={() => choose(active)}
        className={cn(
          "block w-full cursor-pointer rounded-lg border border-solid border-surface bg-background p-2.5 text-left transition-colors duration-200 hover:border-primary/50",
          FOCUS,
        )}
      >
        <Generation key={`${active}-${run}`} provider={provider} />
      </button>
    </div>
  );
};
