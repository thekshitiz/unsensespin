/**
 * Calculates the statistical probability of a user losing their entire bankroll.
 * This is intended to show players that 'RTP' doesn't mean you keep 96% of your money,
 * it means you lose 100% of it eventually.
 */
export function calculateExpectedSpinsToRuin(
    bankroll: number,
    betSize: number,
    rtp: number, // e.g., 0.96
    volatilityFactor: number, // e.g., 1 (low) to 10 (high)
): number {
    const houseEdge = 1 - rtp

    // Simplified Gambler's Ruin logic
    // The more volatile the game, the more 'swings' occur,
    // which often leads to ruin faster even with a high RTP.
    if (houseEdge <= 0) return Infinity

    // Expected number of bets until bankroll is depleted:
    // Bets = Bankroll / (BetSize * HouseEdge)
    // We adjust for volatility because high volatility increases the variance
    // which pushes players to zero faster during 'down' swings.
    const baseSpins = bankroll / (betSize * houseEdge)
    return Math.floor(baseSpins / (1 + volatilityFactor * 0.1))
}
