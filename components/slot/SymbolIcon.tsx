import {
  Anchor,
  Box,
  Cable,
  Castle,
  Coins,
  Crown,
  Fish,
  Flag,
  Lightbulb,
  Map,
  Sailboat,
  ScrollText,
  Shield,
  ShipWheel,
  Sword,
  UserRound,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SymbolId } from "@/types/slot";

const iconMap: Record<SymbolId, LucideIcon> = {
  crown: Crown,
  shield: Shield,
  sword: Sword,
  castle: Castle,
  scroll: ScrollText,
  "coin-chest": Coins,
  banner: Flag,
  map: Map,
  fish: Fish,
  rod: Cable,
  boat: Sailboat,
  anchor: Anchor,
  "treasure-chest": Box,
  wave: Waves,
  lighthouse: Lightbulb,
  fisherman: UserRound,
};

export function SymbolIcon({ symbolId, label, className }: { symbolId: SymbolId; label?: string; className?: string }) {
  const Icon = iconMap[symbolId] ?? ShipWheel;

  return (
    <>
      <Icon aria-hidden className={className ?? "size-8 text-emerald-200"} strokeWidth={1.8} />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}
