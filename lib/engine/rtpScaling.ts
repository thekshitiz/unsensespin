export function applyRtpScaling(rawWin: number, profileBaseRtp: number, targetRtp: number): number {
  if (profileBaseRtp <= 0) {
    return rawWin;
  }

  return roundMoney(rawWin * (targetRtp / profileBaseRtp));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
