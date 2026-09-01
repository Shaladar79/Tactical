/**
 * Tactical
 * Advancement Validator
 *
 * Validates Attribute and Skill advancement against:
 * - Current Rank
 * - Rating caps
 * - XP costs
 * - Available unspent XP
 */

import {
  getAttributeAdvanceCost,
  getSkillAdvanceCost,
  getAttributeCap,
  getSkillCap
} from "./rank-progression.mjs";

/**
 * Calculate unspent XP.
 */
export function getAvailableXP({
  earned = 0,
  spent = 0
} = {}) {

  const xpEarned = Math.max(
    0,
    Number(earned) || 0
  );

  const xpSpent = Math.max(
    0,
    Number(spent) || 0
  );

  return Math.max(
    0,
    xpEarned - xpSpent
  );
}

/**
 * Validate an Attribute advancement.
 *
 * Advancement is assumed to increase the Attribute
 * by exactly 1 point.
 */
export function validateAttributeAdvancement({
  currentScore = 0,
  rank = 0,
  xpEarned = 0,
  xpSpent = 0
} = {}) {

  const current = Math.max(
    0,
    Number(currentScore) || 0
  );

  const nextScore =
    current + 1;

  const cap =
    getAttributeCap(rank);

  const cost =
    getAttributeAdvanceCost(nextScore);

  const availableXP =
    getAvailableXP({
      earned: xpEarned,
      spent: xpSpent
    });

  const withinCap =
    nextScore <= cap;

  const canAfford =
    availableXP >= cost;

  return {
    type: "attribute",

    currentScore: current,
    nextScore,

    cap,
    cost,
    availableXP,

    withinCap,
    canAfford,

    valid:
      withinCap &&
      canAfford,

    reasons: [
      ...(!withinCap
        ? [`Attribute cap at Rank ${rank} is ${cap}.`]
        : []),

      ...(!canAfford
        ? [`Requires ${cost} XP, but only ${availableXP} XP is available.`]
        : [])
    ]
  };
}

/**
 * Validate a Skill advancement.
 *
 * Advancement is assumed to increase the Skill
 * by exactly 1 point.
 */
export function validateSkillAdvancement({
  currentScore = 0,
  rank = 0,
  xpEarned = 0,
  xpSpent = 0
} = {}) {

  const current = Math.max(
    0,
    Number(currentScore) || 0
  );

  const nextScore =
    current + 1;

  const cap =
    getSkillCap(rank);

  const cost =
    getSkillAdvanceCost(nextScore);

  const availableXP =
    getAvailableXP({
      earned: xpEarned,
      spent: xpSpent
    });

  const withinCap =
    nextScore <= cap;

  const canAfford =
    availableXP >= cost;

  return {
    type: "skill",

    currentScore: current,
    nextScore,

    cap,
    cost,
    availableXP,

    withinCap,
    canAfford,

    valid:
      withinCap &&
      canAfford,

    reasons: [
      ...(!withinCap
        ? [`Skill cap at Rank ${rank} is ${cap}.`]
        : []),

      ...(!canAfford
        ? [`Requires ${cost} XP, but only ${availableXP} XP is available.`]
        : [])
    ]
  };
}
