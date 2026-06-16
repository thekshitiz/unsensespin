import type { SymbolId } from '@/types/slot'

export interface PsychologyAnalysis {
    isNearMiss: boolean
    message: string | null
    severity: 'low' | 'medium' | 'high'
}

/**
 * Analyzes a spin result to identify psychological triggers used by slot machines.
 * This is the "Psychologist" layer of the Engineering Shield.
 */
export function analyzeSpinPsychology(
    reelSymbols: SymbolId[],
): PsychologyAnalysis {
    const [s1, s2, s3] = reelSymbols

    // Detect Near-Miss: Two symbols match, and the third is different.
    // In real slots, the virtual reel mapping is often weighted to make this happen
    // more frequently than true random chance would allow.
    const isNearMiss =
        (s1 === s2 && s1 !== s3) ||
        (s1 === s3 && s1 !== s2) ||
        (s2 === s3 && s2 !== s1)

    return {
        isNearMiss,
        severity: isNearMiss ? 'high' : 'low',
        message: isNearMiss
            ? "DOPAMINE ALERT: This 'Near-Miss' is a mathematical illusion. Your brain treats this as a 'not-yet-win', but it is functionally identical to a total miss. The RNG decided this the millisecond you clicked."
            : null,
    }
}
