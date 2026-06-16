"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, CircleDollarSign, Heart, Info, RotateCw, Spade } from "lucide-react";
import { formatMoney } from "@/lib/utils/currency";

type CardColour = "red" | "black";

type BonusCard = {
  id: string;
  label: string;
  className: string;
  freeSpins: number;
  instantMultiplier: number;
};

const cards: BonusCard[] = [
  {
    id: "amber",
    label: "Amber card",
    className: "border-amber-200 bg-amber-300/20 text-amber-50",
    freeSpins: 2,
    instantMultiplier: 2,
  },
  {
    id: "cyan",
    label: "Blue card",
    className: "border-cyan-200 bg-cyan-300/20 text-cyan-50",
    freeSpins: 3,
    instantMultiplier: 1,
  },
  {
    id: "rose",
    label: "Rose card",
    className: "border-rose-200 bg-rose-300/20 text-rose-50",
    freeSpins: 1,
    instantMultiplier: 4,
  },
];

const colourChoices: Record<
  CardColour,
  {
    label: string;
    description: string;
    className: string;
    instantBoost: number;
    freeSpinBoost: number;
  }
> = {
  red: {
    label: "Red cards",
    description: "Adds one extra fake free-spin reveal before the feature closes.",
    className: "border-rose-200 bg-rose-500/15 text-rose-50",
    instantBoost: 0,
    freeSpinBoost: 1,
  },
  black: {
    label: "Black cards",
    description: "Boosts the instant fake award multiplier by 1x.",
    className: "border-slate-300 bg-slate-800 text-slate-50",
    instantBoost: 1,
    freeSpinBoost: 0,
  },
};

export function BonusRoundOverlay({
  betAmount,
  reducedMotion,
  onCollect,
  onSkip,
}: {
  betAmount: number;
  reducedMotion?: boolean;
  onCollect: (amount: number) => void;
  onSkip: () => void;
}) {
  const [selectedColour, setSelectedColour] = useState<CardColour | null>(null);
  const [selectedCard, setSelectedCard] = useState<BonusCard | null>(null);
  const [revealedSpins, setRevealedSpins] = useState(0);
  const [spinAwards, setSpinAwards] = useState<number[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const availableCards = useMemo(() => shuffleCards(cards), []);
  const colourModifier = selectedColour ? colourChoices[selectedColour] : null;
  const instantAward = selectedCard
    ? roundMoney((selectedCard.instantMultiplier + (colourModifier?.instantBoost ?? 0)) * betAmount)
    : 0;
  const totalFreeSpins = selectedCard ? selectedCard.freeSpins + (colourModifier?.freeSpinBoost ?? 0) : 0;
  const spinTotal = spinAwards.reduce((sum, award) => sum + award, 0);
  const totalAward = roundMoney(instantAward + spinTotal);

  function chooseCard(card: BonusCard) {
    if (!selectedColour || selectedCard) {
      return;
    }

    setSelectedCard(card);
    setIsRevealing(true);
    const chosenFreeSpins = card.freeSpins + (colourModifier?.freeSpinBoost ?? 0);
    const awards = Array.from({ length: chosenFreeSpins }, (_, index) => {
      const multiplier = [0, 0.5, 1, 1.5, 2][(index + card.instantMultiplier + (colourModifier?.instantBoost ?? 0)) % 5];
      return roundMoney(multiplier * betAmount);
    });

    awards.forEach((award, index) => {
      window.setTimeout(
        () => {
          setSpinAwards((items) => [...items, award]);
          setRevealedSpins((count) => count + 1);
          if (index === awards.length - 1) {
            setIsRevealing(false);
          }
        },
        reducedMotion ? 120 : 750 + index * 900,
      );
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/88 p-4 backdrop-blur-md">
      <motion.section
        initial={reducedMotion ? false : { y: 24, opacity: 0 }}
        animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
        className="w-full max-w-5xl rounded-lg border border-amber-200/30 bg-slate-950 p-5 shadow-[0_0_70px_rgba(251,191,36,0.18)]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">Fake bonus lab</p>
            <h2 className="mt-2 text-3xl font-black text-white">Pick red or black</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              This separate screen demonstrates how bonus modes, choice reveals, and slower pacing can hold attention.
              Pick a playing-card colour first, then choose a feature card. Awards are fake and educational only.
            </p>
          </div>
          <button className="secondary-button" onClick={onSkip}>
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(["red", "black"] as CardColour[]).map((colour) => {
            const choice = colourChoices[colour];
            const isSelected = selectedColour === colour;
            const Icon = colour === "red" ? Heart : Spade;
            return (
              <button
                key={colour}
                disabled={Boolean(selectedCard)}
                onClick={() => setSelectedColour(colour)}
                className={`min-h-36 rounded-lg border p-4 text-left transition hover:scale-[1.01] disabled:cursor-default ${choice.className} ${
                  isSelected ? "ring-2 ring-white/80" : "opacity-90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-8" />
                  {isSelected ? <Check className="size-6" /> : null}
                </div>
                <p className="mt-6 text-2xl font-black">{choice.label}</p>
                <p className="mt-2 text-sm opacity-85">{choice.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {availableCards.map((card) => {
            const isSelected = selectedCard?.id === card.id;
            return (
              <button
                key={card.id}
                disabled={!selectedColour || Boolean(selectedCard)}
                onClick={() => chooseCard(card)}
                className={`min-h-40 rounded-lg border p-4 text-left transition hover:scale-[1.01] disabled:cursor-default ${card.className} ${
                  isSelected ? "ring-2 ring-white/80" : selectedColour ? "opacity-95" : "opacity-45"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CircleDollarSign className="size-7" />
                  {isSelected ? <Check className="size-6" /> : null}
                </div>
                <p className="mt-8 text-xl font-black">{card.label}</p>
                <p className="mt-2 text-sm opacity-85">
                  {selectedColour
                    ? "Reveal fake free spins and one instant feature award."
                    : "Pick red or black first to unlock this feature card."}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-amber-100">
              <RotateCw className="size-5" />
              <h3 className="font-bold">Fake free-spin reveal</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {selectedCard ? (
                Array.from({ length: totalFreeSpins }, (_, index) => (
                  <motion.div
                    key={index}
                    initial={reducedMotion ? false : { opacity: 0.35, scale: 0.96 }}
                    animate={
                      revealedSpins > index && !reducedMotion
                        ? { opacity: 1, scale: 1 }
                        : reducedMotion
                          ? undefined
                          : { opacity: 0.55, scale: 0.96 }
                    }
                    className="rounded-md border border-white/10 bg-slate-900 p-4 text-center"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">Reveal {index + 1}</p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {revealedSpins > index ? formatMoney(spinAwards[index]) : "..."}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="col-span-full text-sm text-slate-400">
                  Pick red or black, then choose a card to reveal the fake bonus sequence.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-slate-200">
              <Info className="size-5 text-emerald-300" />
              <h3 className="font-bold">Feature summary</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Playing-card choice" value={selectedColour ? colourChoices[selectedColour].label : "Not picked"} />
              <Row label="Instant fake award" value={formatMoney(instantAward)} />
              <Row label="Fake free spins" value={String(totalFreeSpins)} />
              <Row label="Revealed so far" value={formatMoney(spinTotal)} />
              <Row label="Total fake feature" value={formatMoney(totalAward)} strong />
            </dl>
            <button
              disabled={!selectedCard || isRevealing}
              className="primary-button mt-5 w-full disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => onCollect(totalAward)}
            >
              Collect fake feature result
            </button>
          </section>
        </div>
      </motion.section>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className={strong ? "text-xl font-black text-amber-100" : "font-semibold text-white"}>{value}</dd>
    </div>
  );
}

function shuffleCards(items: BonusCard[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
