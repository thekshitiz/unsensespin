import { warningMessages } from "@/lib/constants/messages";
import { currentLossStreak } from "@/lib/slot/stats";
import type { SlotSession, SpinRecord, UserSettings } from "@/types/session";
import type { SessionWarning, WarningType } from "@/types/warning";

export function buildWarning(type: WarningType): SessionWarning {
  return {
    type,
    title: warningMessages[type].title,
    message: warningMessages[type].message,
    timestamp: new Date().toISOString(),
  };
}

export function detectSpinWarnings(params: {
  session: SlotSession;
  spinsBeforeCurrent: SpinRecord[];
  currentSpin: SpinRecord;
  previousBet: number;
  settings: UserSettings;
  elapsedMinutes: number;
}): SessionWarning[] {
  const warnings: SessionWarning[] = [];
  const { currentSpin, elapsedMinutes, previousBet, session, settings, spinsBeforeCurrent } = params;
  const lossStreakBeforeSpin = currentLossStreak(spinsBeforeCurrent);

  if (currentSpin.isNearMiss) {
    warnings.push(buildWarning("near-miss"));
  }

  if (currentSpin.lossStreakAtSpin >= 5) {
    warnings.push(buildWarning("loss-streak"));
  }

  if (lossStreakBeforeSpin >= 3 && currentSpin.betAmount > previousBet) {
    warnings.push(buildWarning("bet-increase-after-losses"));
  }

  if (
    currentSpin.secondsSincePreviousSpin !== undefined &&
    currentSpin.secondsSincePreviousSpin > 0 &&
    currentSpin.secondsSincePreviousSpin < 3
  ) {
    warnings.push(buildWarning("rapid-spins"));
  }

  if (!session.stopLossTriggered && session.startingBalance - currentSpin.balanceAfterSpin >= settings.stopLossLimit) {
    warnings.push(buildWarning("stop-loss-reached"));
  }

  if (!session.timeLimitTriggered && elapsedMinutes >= settings.sessionTimeReminderMinutes) {
    warnings.push(buildWarning("time-limit-reached"));
  }

  if (currentSpin.resultMultiplier >= 10) {
    warnings.push(buildWarning("big-win-context"));
  }

  return dedupeWarnings(warnings);
}

function dedupeWarnings(warnings: SessionWarning[]) {
  const seen = new Set<WarningType>();
  return warnings.filter((warning) => {
    if (seen.has(warning.type)) {
      return false;
    }
    seen.add(warning.type);
    return true;
  });
}
