/**
 * Tactical
 * Session XP Helper
 *
 * Base Session XP:
 * 3 × (Average Party Rank + 1)
 *
 * If the resulting Base XP contains a decimal:
 * - .5 or less rounds down
 * - greater than .5 rounds up
 *
 * Bonus XP is added manually afterward.
 */

/**
 * Calculate the average Rank of a party.
 */
export function getAveragePartyRank(ranks = []) {

  const validRanks = ranks.map(
    rank => Math.max(0, Number(rank) || 0)
  );

  if (validRanks.length === 0) {
    return 0;
  }

  const total = validRanks.reduce(
    (sum, rank) => sum + rank,
    0
  );

  return total / validRanks.length;
}

/**
 * Tactical XP rounding rule.
 *
 * Decimal <= .5 = floor
 * Decimal > .5 = ceiling
 */
export function roundSessionXP(value = 0) {

  const amount = Math.max(
    0,
    Number(value) || 0
  );

  const whole = Math.floor(amount);
  const decimal = amount - whole;

  return decimal <= 0.5
    ? Math.floor(amount)
    : Math.ceil(amount);
}

/**
 * Calculate base session XP.
 *
 * Base XP = 3 × (Average Party Rank + 1)
 */
export function getBaseSessionXP(averageRank = 0) {

  const rank = Math.max(
    0,
    Number(averageRank) || 0
  );

  const rawXP =
    3 * (rank + 1);

  return roundSessionXP(rawXP);
}

/**
 * Calculate the complete session XP award.
 */
export function calculateSessionXP({
  ranks = [],
  bonusXP = 0
} = {}) {

  const averageRank =
    getAveragePartyRank(ranks);

  const rawBaseXP =
    3 * (averageRank + 1);

  const baseXP =
    roundSessionXP(rawBaseXP);

  const bonus = Math.max(
    0,
    Number(bonusXP) || 0
  );

  const totalXP =
    baseXP + bonus;

  return {
    averageRank,
    rawBaseXP,
    baseXP,
    bonusXP: bonus,
    totalXP
  };
}
