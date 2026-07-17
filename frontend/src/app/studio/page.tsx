"use client";

import Link from "next/link";
import { ScanEye, FilePenLine } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";

const studioModes = [
  {
    href: "/studio/visio",
    title: "Visio",
    description:
      "Intelligent football video analysis powered by AI and computer vision",
    Icon: ScanEye,
  },
  {
    href: "/studio/canvas",
    title: "Canvas",
    description:
      "Create professional tactical visuals using built-in football templates and overlays.",
    Icon: FilePenLine,
  },
] as const;

export default function StudioPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.5rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-[1180px] flex-col gap-10"
      >
        <div className="space-y-3 text-center">
          <p className="accent-text text-xs font-semibold uppercase tracking-[0.34em]">
            Studio Lab
          </p>
          <h1 className="font-display text-[3rem] leading-[0.92] text-white sm:text-[4rem]">
            Choose Studio Mode
          </h1>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {studioModes.map((mode, index) => {
            const Icon = mode.Icon;

            return (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                  delay: 0.08 * (index + 1),
                }}
              >
                <Link href={mode.href} className="block h-full">
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="group h-full"
                  >
                    <Card className="h-full border-zinc-800/80 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_10%,transparent),_transparent_42%),linear-gradient(180deg,rgba(24,24,24,0.96),rgba(10,10,10,0.96))] transition-[border-color,box-shadow] duration-200 group-hover:border-[color:var(--accent)]/50 group-hover:shadow-[0_22px_65px_rgba(0,0,0,0.34)]">
                      <CardContent className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center sm:px-12 sm:py-14">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="accent-bg-soft accent-border-soft accent-text flex h-20 w-20 items-center justify-center border"
                        >
                          <Icon className="h-14 w-14" />
                        </motion.div>

                        <h2 className="mt-10 font-display text-[2.2rem] leading-none text-white">
                          {mode.title}
                        </h2>

                        <p className="mt-5 max-w-[280px] text-sm leading-7 text-zinc-400">
                          {mode.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
