/**
 * Tactical
 * Rank and XP Progression
 *
 * Rank is determined by Total XP Spent.
 */

/**
 * Cumulative XP-spent thresholds.
 *
 * R0 = 0
 * R1 = 15
 * R2 = 45
 * R3 = 105
 */
export const RANK_THRESHOLDS = {
  0: 0,
  1: 15,
  2: 45,
  3: 105
};

/**
 * Determine Rank from total XP spent.
 *
 * Currently supports the locked T1 progression
 * through Rank 3.
 */
export function getRankFromXPSpent(xpSpent = 0) {

  const spent = Math.max(
    0,
    Number(xpSpent) || 0
  );

  let rank = 0;

  for (const [rankKey, threshold] of Object.entries(RANK_THRESHOLDS)) {
    const rankValue = Number(rankKey);

    if (spent >= threshold && rankValue > rank) {
      rank = rankValue;
    }
  }

  return rank;
}

/**
 * Get the cumulative XP threshold for a Rank.
 */
export function getRankThreshold(rank = 0) {

  const value = Math.max(
    0,
    Number(rank) || 0
  );

  return RANK_THRESHOLDS[value] ?? null;
}

/**
 * Calculate Attribute advancement cost.
 *
 * Cost = new score × 5 XP.
 */
export function getAttributeAdvanceCost(newScore = 0) {

  const score = Math.max(
    0,
    Number(newScore) || 0
  );

  return score * 5;
}

/**
 * Calculate Skill advancement cost.
 *
 * Cost = new score × 3 XP.
 */
export function getSkillAdvanceCost(newScore = 0) {

  const score = Math.max(
    0,
    Number(newScore) || 0
  );

  return score * 3;
}

/**
 * Attribute cap = Rank + 2.
 */
export function getAttributeCap(rank = 0) {

  const value = Math.max(
    0,
    Number(rank) || 0
  );

  return value + 2;
}

/**
 * Skill cap = Rank + 1.
 */
export function getSkillCap(rank = 0) {

  const value = Math.max(
    0,
    Number(rank) || 0
  );

  return value + 1;
}

/**
 * Maximum Wounds by Rank.
 *
 * R0 = 2
 * +1 Max Wound at each odd Rank.
 */
export function getMaxWoundsForRank(rank = 0) {

  const value = Math.max(
    0,
    Number(rank) || 0
  );

  return 2 + Math.ceil(value / 2);
}

/**
 * Maximum Rank Dice available per session.
 *
 * Rank Dice = character Rank.
 */
export function getMaxRankDice(rank = 0) {

  return Math.max(
    0,
    Number(rank) || 0
  );
}
