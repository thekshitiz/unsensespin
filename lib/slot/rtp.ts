export function calculateHouseEdge(rtp: number): number {
  return Number((100 - rtp).toFixed(2));
}

export function calculateExpectedLoss(totalWagered: number, rtp: number): number {
  return roundMoney(totalWagered * (1 - rtp / 100));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
