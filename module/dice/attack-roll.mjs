/**
 * Tactical
 * Attack Roll Helper
 */

import { buildTacticalPool } from "./build-pool.mjs";
import { buildTacticalTN } from "./tn-modifiers.mjs";
import { rollTacticalPool } from "./tactical-roll.mjs";

/**
 * Resolve a standard Tactical attack roll.
 *
 * @param {object} options
 *
 * Pool inputs:
 * @param {number} options.attribute
 * @param {number} options.skill
 * @param {boolean} options.specialization
 * @param {boolean} options.rankDie
 * @param {number} options.diceModifier
 *
 * TN inputs:
 * @param {number} options.baseTN
 * @param {string} options.cover
 * @param {boolean} options.flanking
 * @param {string} options.elevation
 * @param {string} options.range
 * @param {number|null} options.rangeOverride
 * @param {number} options.tnModifier
 *
 * Display:
 * @param {string} options.flavor
 *
 * @returns {Promise<object>}
 */
export async function rollTacticalAttack({
  attribute = 0,
  skill = 0,
  specialization = false,
  rankDie = false,
  diceModifier = 0,

  baseTN = 7,
  cover = "none",
  flanking = false,
  elevation = "same",
  range = "short",
  rangeOverride = null,
  tnModifier = 0,

  flavor = "Attack Roll"
} = {}) {

  /* -------------------------------------------- */
  /*  Build Dice Pool                             */
  /* -------------------------------------------- */

  const poolData = buildTacticalPool({
    attribute,
    skill,
    specialization,
    rankDie,
    modifier: diceModifier
  });

  /* -------------------------------------------- */
  /*  Build Target Number                         */
  /* -------------------------------------------- */

  const tnData = buildTacticalTN({
    baseTN,
    cover,
    flanking,
    elevation,
    range,
    rangeOverride,
    modifier: tnModifier
  });

  /* -------------------------------------------- */
  /*  Roll                                        */
  /* -------------------------------------------- */

  const rollData = await rollTacticalPool({
    pool: poolData.total,
    tn: tnData.finalTN,
    flavor
  });

  /* -------------------------------------------- */
  /*  Combined Result                             */
  /* -------------------------------------------- */

  return {
    ...rollData,

    poolData,
    tnData
  };
}
