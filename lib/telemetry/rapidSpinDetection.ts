export function detectRapidSpin(secondsSincePreviousSpin: number | null | undefined): boolean {
  return secondsSincePreviousSpin !== null && secondsSincePreviousSpin !== undefined && secondsSincePreviousSpin > 0 && secondsSincePreviousSpin < 3;
}
