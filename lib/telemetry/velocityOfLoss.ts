export function calculateVelocityOfLoss(
  totalWagered: number,
  totalReturned: number,
  sessionStartTimestamp: number,
  currentTimestamp: number,
): number {
  const elapsedMinutes = Math.max((currentTimestamp - sessionStartTimestamp) / 60000, 1 / 60);
  const loss = Math.max(0, totalWagered - totalReturned);
  return Math.round((loss / elapsedMinutes) * 100) / 100;
}
