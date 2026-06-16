import type { WarningType } from "@/types/warning";

export const disclaimer =
  "This is a fake-money educational simulator. Real gambling can cause financial harm.";

export const warningMessages: Record<WarningType, { title: string; message: string }> = {
  "near-miss": {
    title: "Near miss",
    message:
      "That looked close, but it was still a loss. Near-misses can make random games feel more controllable than they are.",
  },
  "loss-streak": {
    title: "Losing streak",
    message:
      "Several losses in a row do not make a win more likely. Each spin is independent.",
  },
  "bet-increase-after-losses": {
    title: "Possible loss chasing",
    message:
      "You increased your bet after a losing streak. This is a common loss-chasing pattern.",
  },
  "stop-loss-reached": {
    title: "Stop-loss reached",
    message:
      "You reached your chosen fake loss limit. In real gambling, stopping here would protect money.",
  },
  "time-limit-reached": {
    title: "Time reminder",
    message:
      "Your planned session time is over. Time-on-device is one way gambling harm can grow.",
  },
  "rapid-spins": {
    title: "Rapid spins",
    message: "Fast repeated spins can make losses accumulate before you notice.",
  },
  "big-win-context": {
    title: "Big win context",
    message:
      "A big win can make the game feel profitable, but one result does not remove the house edge.",
  },
};
