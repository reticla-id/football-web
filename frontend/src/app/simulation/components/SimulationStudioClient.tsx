"use client";

import { type ElementType, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ChevronRight,
  Flag,
  FolderClock,
  Gauge,
  Play,
  Save,
  ShieldPlus,
  Sparkles,
  Swords,
  Target,
  Trophy,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AchievementCard from "./AchievementCard";
import BenchCard from "./BenchCard";
import ChartCard from "./ChartCard";
import ComparisonCard from "./ComparisonCard";
import FormationCard from "./FormationCard";
import HeatmapCard from "./HeatmapCard";
import LineupCard from "./LineupCard";
import PlayerRatingCard from "./PlayerRatingCard";
import SimulationCard from "./SimulationCard";
import SimulationHistoryCard from "./SimulationHistoryCard";
import SimulationLoading from "./SimulationLoading";
import SimulationStepper, {
  type SimulationStep,
  type SimulationStepId,
} from "./SimulationStepper";
import SimulationTabs, { type SimulationResultTab } from "./SimulationTabs";
import TacticSlider from "./TacticSlider";
import TimelineCard from "./TimelineCard";

const simulationSteps: SimulationStep[] = [
  { id: "match-setup", label: "Match Setup", eyebrow: "Step 1" },
  { id: "formation-squad", label: "Formation & Squad", eyebrow: "Step 2" },
  { id: "tactics", label: "Tactics", eyebrow: "Step 3" },
  { id: "simulation-mode", label: "Simulation Mode", eyebrow: "Step 4" },
  { id: "prediction-summary", label: "Prediction Summary", eyebrow: "Step 5" },
];

const loadingStages = [
  "Analyzing lineups...",
  "Calculating team strength...",
  "Running statistical models...",
  "Generating tactical simulation...",
  "Preparing AI analysis...",
];

const simulationModes = [
  {
    id: "quick",
    title: "Quick",
    description: "Fast single-pass scenario execution for instant previews.",
    Icon: Play,
  },
  {
    id: "detailed",
    title: "Detailed",
    description: "Expanded phase analysis with layered event sequencing.",
    Icon: BrainCircuit,
  },
  {
    id: "tactical-analysis",
    title: "Tactical Analysis",
    description: "Positioning, structure, and pressure map emphasis.",
    Icon: Target,
  },
  {
    id: "live-commentary",
    title: "Live Commentary",
    description: "Narrative-driven simulation playback and storytelling mode.",
    Icon: Sparkles,
  },
] as const;

const defaultTactics = {
  possession: 58,
  pressing: 71,
  tempo: 64,
  width: 53,
  defensiveLine: 61,
};

function EmptySelect({ placeholder }: { placeholder: string }) {
  return (
    <Select defaultValue="placeholder">
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="placeholder">{placeholder}</SelectItem>
      </SelectContent>
    </Select>
  );
}

function EmptyStateSection({
  icon: Icon,
  title,
  description,
  ctaLabel,
}: {
  icon: ElementType;
  title: string;
  description: string;
  ctaLabel?: string;
}) {
  return (
    <SimulationCard title={title} description={description}>
      <div className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-zinc-800 bg-black/20 px-6 py-10 text-center">
        <div className="accent-bg-soft accent-border-soft flex h-16 w-16 items-center justify-center border">
          <Icon className="accent-text h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-medium text-white">Nothing here yet</p>
        <p className="mt-2 max-w-md text-sm leading-7 text-zinc-500">{description}</p>
        {ctaLabel ? (
          <div className="mt-6 inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
            {ctaLabel}
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          </div>
        ) : null}
      </div>
    </SimulationCard>
  );
}

function ResultPlaceholderCard({
  title,
  description,
  heightClassName = "min-h-[220px]",
}: {
  title: string;
  description: string;
  heightClassName?: string;
}) {
  return (
    <SimulationCard title={title} description={description}>
      <div className={`flex items-center justify-center border border-dashed border-zinc-800 bg-black/20 ${heightClassName}`}>
        <p className="text-sm text-zinc-500">{title}</p>
      </div>
    </SimulationCard>
  );
}

function ResultOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          "Expected Goals",
          "Possession",
          "Win Probability",
          "Confidence",
        ].map((label) => (
          <div key={label} className="border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {label}
            </p>
            <p className="mt-5 font-display text-[2.3rem] leading-none text-white">--</p>
            <p className="mt-2 text-sm text-zinc-500">Awaiting engine output</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SimulationCard
          title="AI Match Insight"
          description="Generated tactical explanation, swing factors, and scenario risk notes will appear here."
        >
          <div className="min-h-[240px] border border-dashed border-zinc-800 bg-black/20 p-6">
            <p className="text-sm leading-7 text-zinc-500">
              Insight output is not connected yet. This panel is ready for future simulation
              narrative, tactical highlights, and model confidence commentary.
            </p>
          </div>
        </SimulationCard>

        <SimulationCard
          title="Simulation Gamification"
          description="Progression and reputation indicators for the Simulation Lab."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Simulation Level", value: "00" },
              { label: "Simulation Score", value: "--" },
              { label: "Confidence Badge", value: "Pending" },
              { label: "Prediction Accuracy", value: "Locked" },
            ].map((item) => (
              <div key={item.label} className="border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-4 text-lg font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </SimulationCard>
      </div>
    </div>
  );
}

export default function SimulationStudioClient() {
  const [activeStep, setActiveStep] = useState<SimulationStepId>("match-setup");
  const [simulationMode, setSimulationMode] = useState<string>("detailed");
  const [activeTab, setActiveTab] = useState<SimulationResultTab>("overview");
  const [engineState, setEngineState] = useState<"idle" | "loading" | "result">("idle");
  const [progress, setProgress] = useState(0);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [tactics, setTactics] = useState(defaultTactics);

  useEffect(() => {
    if (engineState !== "loading") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 4, 100);
        const nextIndex = Math.min(
          Math.floor((next / 100) * loadingStages.length),
          loadingStages.length - 1
        );

        setLoadingIndex(nextIndex);

        if (next >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setEngineState("result");
            setActiveTab("overview");
          }, 320);
        }

        return next;
      });
    }, 140);

    return () => window.clearInterval(interval);
  }, [engineState]);

  const currentStage = loadingStages[loadingIndex] ?? loadingStages[0];

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case "match-setup":
        return (
          <SimulationCard
            title="Match Setup"
            description="Define the simulation environment before tactical modelling begins."
          >
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="border border-zinc-800 bg-zinc-950/65 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Home Team
                </p>
                <div className="mt-4 flex min-h-[110px] items-center justify-center border border-dashed border-zinc-800 bg-black/20">
                  <p className="text-sm text-zinc-500">Select home club</p>
                </div>
              </div>

              <div className="border border-zinc-800 bg-zinc-950/65 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Away Team
                </p>
                <div className="mt-4 flex min-h-[110px] items-center justify-center border border-dashed border-zinc-800 bg-black/20">
                  <p className="text-sm text-zinc-500">Select away club</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <EmptySelect placeholder="Select competition" />
              <EmptySelect placeholder="Select season" />
              <EmptySelect placeholder="Select venue" />
            </div>
          </SimulationCard>
        );
      case "formation-squad":
        return (
          <div className="grid gap-6 xl:grid-cols-2">
            {["Home", "Away"].map((side) => (
              <SimulationCard
                key={side}
                title={`${side} Squad Build`}
                description={`Configure ${side.toLowerCase()} structure, starting XI, and bench depth.`}
              >
                <div className="space-y-5">
                  <FormationCard side={side as "Home" | "Away"} formation="4-3-3" />

                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Starting XI
                    </p>
                    <div className="grid gap-2">
                      {Array.from({ length: 11 }).map((_, index) => (
                        <LineupCard key={index} index={index} />
                      ))}
                    </div>
                  </div>

                  <BenchCard />
                </div>
              </SimulationCard>
            ))}
          </div>
        );
      case "tactics":
        return (
          <SimulationCard
            title="Tactical Inputs"
            description="Shape the simulation style with controllable football behaviours and intensity levels."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <TacticSlider
                label="Possession"
                value={tactics.possession}
                onChange={(value) => setTactics((current) => ({ ...current, possession: value }))}
              />
              <TacticSlider
                label="Pressing"
                value={tactics.pressing}
                onChange={(value) => setTactics((current) => ({ ...current, pressing: value }))}
              />
              <TacticSlider
                label="Tempo"
                value={tactics.tempo}
                onChange={(value) => setTactics((current) => ({ ...current, tempo: value }))}
              />
              <TacticSlider
                label="Width"
                value={tactics.width}
                onChange={(value) => setTactics((current) => ({ ...current, width: value }))}
              />
              <div className="xl:col-span-2">
                <TacticSlider
                  label="Defensive Line"
                  value={tactics.defensiveLine}
                  onChange={(value) =>
                    setTactics((current) => ({ ...current, defensiveLine: value }))
                  }
                />
              </div>
            </div>
          </SimulationCard>
        );
      case "simulation-mode":
        return (
          <SimulationCard
            title="Simulation Mode"
            description="Choose how deep the studio should model the match experience."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {simulationModes.map((mode) => {
                const active = simulationMode === mode.id;
                const Icon = mode.Icon;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSimulationMode(mode.id)}
                    className={`border p-5 text-left transition-all duration-200 ${
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
                        : "border-zinc-800 bg-zinc-950/65 hover:border-zinc-700 hover:bg-zinc-900/70"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-zinc-800 bg-black/40">
                        <Icon className={active ? "accent-text h-6 w-6" : "h-6 w-6 text-zinc-500"} />
                      </div>
                      <div>
                        <p className={active ? "text-base font-medium text-white" : "text-base font-medium text-white"}>
                          {mode.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-zinc-400">{mode.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </SimulationCard>
        );
      case "prediction-summary":
        return (
          <SimulationCard
            title="Prediction Summary"
            description="Review the simulation package before triggering the engine."
            className="bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_10%,transparent),_transparent_44%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(8,8,8,0.98))]"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Expected Goals", icon: Target },
                { label: "Possession", icon: Gauge },
                { label: "Win Probability", icon: Trophy },
                { label: "Confidence", icon: WandSparkles },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="border border-zinc-800 bg-zinc-950/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                        {item.label}
                      </p>
                      <Icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <p className="mt-5 font-display text-[2.5rem] leading-none text-white">--</p>
                    <p className="mt-2 text-sm text-zinc-500">Placeholder KPI</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 border border-zinc-800 bg-zinc-950/65 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Engine Status
                </p>
                <p className="mt-2 text-base font-medium text-white">Ready to run simulation</p>
                <p className="mt-1 text-sm text-zinc-500">
                  No model output yet. This screen is prepared for future real-time analysis.
                </p>
              </div>

              <Button
                type="button"
                className="min-w-[190px]"
                onClick={() => {
                  setProgress(0);
                  setLoadingIndex(0);
                  setEngineState("loading");
                }}
              >
                <Play className="h-4 w-4" />
                Run Simulation
              </Button>
            </div>
          </SimulationCard>
        );
      default:
        return null;
    }
  }, [activeStep, simulationMode, tactics]);

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="space-y-8"
      >
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SimulationCard
            title="Simulation Studio"
            description="A premium football simulation workspace for building scenarios, testing tactical changes, and preparing predictive match intelligence."
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-5">
                <p className="accent-text text-xs font-semibold uppercase tracking-[0.34em]">
                  Simulation Lab
                </p>
                <h1 className="font-display text-[3rem] leading-[0.9] text-white sm:text-[4rem]">
                  Build, Run, and Compare
                  <br />
                  Match Simulations
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-400">
                  Configure both sides, shape tactical intent, and prepare the Simulation
                  Engine for predictive storytelling, comparison workflows, and gamified
                  model feedback.
                </p>
              </div>

              <Button
                type="button"
                className="min-w-[190px]"
                onClick={() => {
                  setEngineState("idle");
                  setActiveStep("match-setup");
                }}
              >
                <ShieldPlus className="h-4 w-4" />
                New Simulation
              </Button>
            </div>
          </SimulationCard>

          <SimulationCard
            title="Studio Progress"
            description="Gamified readiness indicators for the Simulation Lab."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Simulation Level", value: "01", icon: Sparkles },
                { label: "Simulation Score", value: "--", icon: Gauge },
                { label: "Confidence Badge", value: "Pending", icon: Flag },
                { label: "Prediction Accuracy", value: "Locked", icon: Trophy },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                        {item.label}
                      </p>
                      <Icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <p className="mt-4 text-lg font-medium text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </SimulationCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <EmptyStateSection
            icon={FolderClock}
            title="Recent Simulations"
            description="Completed match scenarios will appear here for replay, comparison, and iteration."
            ctaLabel="Start the first simulation"
          />
          <EmptyStateSection
            icon={Save}
            title="Saved Simulations"
            description="Pinned or archived studio runs will be stored here for future decision-making workflows."
            ctaLabel="No saved simulations yet"
          />
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <SimulationStepper
              steps={simulationSteps}
              activeStep={activeStep}
              onStepChange={(step) => {
                setEngineState("idle");
                setActiveStep(step);
              }}
            />

            {engineState === "loading" ? (
              <SimulationLoading
                progress={progress}
                currentStage={currentStage}
                stages={loadingStages}
              />
            ) : null}

            {engineState !== "loading" ? stepContent : null}

            {engineState === "result" ? (
              <div className="space-y-6">
                <SimulationTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {activeTab === "overview" ? <ResultOverview /> : null}
                {activeTab === "timeline" ? <TimelineCard /> : null}
                {activeTab === "tactical" ? (
                  <ResultPlaceholderCard
                    title="Tactical Insight"
                    description="Shape maps, AI explanations, and control lane insights will appear here."
                    heightClassName="min-h-[320px]"
                  />
                ) : null}
                {activeTab === "players" ? (
                  <SimulationCard
                    title="Player Ratings"
                    description="Individual performance output will be rendered as soon as player-linked simulation data is connected."
                  >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {["Home Player", "Away Player", "Impact Sub", "Playmaker", "Defender", "Goalkeeper"].map((label) => (
                        <PlayerRatingCard key={label} label={label} />
                      ))}
                    </div>
                  </SimulationCard>
                ) : null}
                {activeTab === "heatmaps" ? <HeatmapCard /> : null}
                {activeTab === "charts" ? <ChartCard /> : null}
              </div>
            ) : null}

            <SimulationCard
              title="Simulation History"
              description="The lab will store previous runs, experiments, and scenario branches in this history lane."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <SimulationHistoryCard
                  title="Original Simulation"
                  description="No run saved yet. Your baseline simulation will appear here."
                />
                <SimulationHistoryCard
                  title="Modified Scenario"
                  description="What-if changes and recalculated variants will show once connected."
                />
                <SimulationHistoryCard
                  title="Archived Snapshot"
                  description="Save important scenarios for review, comparison, or replay."
                />
              </div>
            </SimulationCard>

            <SimulationCard
              title="Comparison Workspace"
              description="Compare the original and modified simulations once recalculated."
            >
              <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Original Simulation
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Win %", "xG", "Possession", "Confidence"].map((label) => (
                      <ComparisonCard key={label} label={label} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-xs uppercase tracking-[0.26em] text-zinc-500">
                    vs
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Modified Simulation
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Win %", "xG", "Possession", "Confidence"].map((label) => (
                      <ComparisonCard key={label} label={label} />
                    ))}
                  </div>
                </div>
              </div>
            </SimulationCard>

            <SimulationCard
              title="Achievements"
              description="Gamification milestones for successful scenario work, accuracy, and tactical experimentation."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {["Tactical Genius", "Underdog Winner", "Perfect Prediction"].map((title) => (
                  <AchievementCard key={title} title={title} />
                ))}
              </div>
            </SimulationCard>
          </div>

          <div className="2xl:sticky 2xl:top-6 2xl:self-start">
            <SimulationCard
              title="What-if Panel"
              description="A floating studio lane for future changes and instant recalculation."
            >
              <div className="space-y-4">
                {[
                  {
                    label: "Formation",
                    description: "Swap base shape, press structure, and defensive shell.",
                    icon: Swords,
                  },
                  {
                    label: "Lineup",
                    description: "Toggle personnel, impact substitutions, and role changes.",
                    icon: ShieldPlus,
                  },
                  {
                    label: "Tactics",
                    description: "Adjust control, pressing, tempo, and transition profiles.",
                    icon: BrainCircuit,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="border border-zinc-800 bg-zinc-950/70 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-800 bg-black/40 text-zinc-500">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button type="button" variant="outline" className="w-full">
                  Recalculate Simulation
                </Button>
              </div>
            </SimulationCard>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
