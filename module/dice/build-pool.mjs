/**
 * Tactical
 * Dice Pool Builder
 *
 * Builds a standard Tactical dice pool before it is rolled.
 */

/**
 * Build a Tactical dice pool.
 *
 * @param {object} options
 * @param {number} options.attribute - Attribute rating.
 * @param {number} options.skill - Skill rating.
 * @param {boolean} options.specialization - Whether one applicable Specialization applies.
 * @param {boolean} options.rankDie - Whether one Rank Die is being spent.
 * @param {number} options.modifier - Other dice modifiers.
 *
 * @returns {object}
 */
export function buildTacticalPool({
  attribute = 0,
  skill = 0,
  specialization = false,
  rankDie = false,
  modifier = 0
} = {}) {

  const attributeDice = Math.max(
    0,
    Number(attribute) || 0
  );

  const skillDice = Math.max(
    0,
    Number(skill) || 0
  );

  const specializationDice = specialization ? 1 : 0;

  const rankDice = rankDie ? 1 : 0;

  const modifierDice = Number(modifier) || 0;

  const total =
    attributeDice +
    skillDice +
    specializationDice +
    rankDice +
    modifierDice;

  return {
    total: Math.max(0, total),

    parts: {
      attribute: attributeDice,
      skill: skillDice,
      specialization: specializationDice,
      rankDie: rankDice,
      modifier: modifierDice
    }
  };
}
