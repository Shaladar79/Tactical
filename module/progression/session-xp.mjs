/**
 * Tactical
 * Session XP Helper
 *
 * Base Session XP:
 * 3 × (Average Party Rank + 1)
 *
 * The GM may add any amount of Bonus XP when
 * calculating the final session award.
 */

/**
 * Calculate the average Rank of a party.
 *
 * @param {Array<number>} ranks
 *
 * @returns {number}
 */
export function getAveragePartyRank(ranks = []) {

  const validRanks = ranks
    .map(rank => Math.max(0, Number(rank) || 0));

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
 * Calculate base session XP.
 *
 * Base XP = 3 × (Average Party Rank + 1)
 *
 * @param {number} averageRank
 *
 * @returns {number}
 */
export function getBaseSessionXP(averageRank = 0) {

  const rank = Math.max(
    0,
    Number(averageRank) || 0
  );

  return 3 * (rank + 1);
}

/**
 * Calculate a complete session XP award.
 *
 * @param {object} options
 * @param {Array<number>} options.ranks
 * @param {number} options.bonusXP
 *
 * @returns {object}
 */
export function calculateSessionXP({
  ranks = [],
  bonusXP = 0
} = {}) {

  const averageRank =
    getAveragePartyRank(ranks);

  const baseXP =
    getBaseSessionXP(averageRank);

  const bonus = Math.max(
    0,
    Number(bonusXP) || 0
  );

  const totalXP =
    baseXP + bonus;

  return {
    averageRank,
    baseXP,
    bonusXP: bonus,
    totalXP
  };
}
