/**
 * Tactical
 * Detection Roll
 */

import { buildTacticalPool } from "./build-pool.mjs";
import { rollTacticalPool } from "./tactical-roll.mjs";
import { resolveTacticalOpposedRoll } from "./opposed-roll.mjs";

/**
 * Resolve a Tactical Detection contest.
 *
 * @param {object} options
 *
 * Observer:
 * @param {number} options.observerPerception
 * @param {number} options.observerAwareness
 * @param {boolean} options.observerSpecialization
 * @param {number} options.observerModifier
 *
 * Concealed Target:
 * @param {number} options.targetAgility
 * @param {number} options.targetStealth
 * @param {boolean} options.targetSpecialization
 * @param {number} options.targetModifier
 *
 * @returns {Promise<object>}
 */
export async function rollTacticalDetection({
  observerPerception = 0,
  observerAwareness = 0,
  observerSpecialization = false,
  observerModifier = 0,

  targetAgility = 0,
  targetStealth = 0,
  targetSpecialization = false,
  targetModifier = 0
} = {}) {

  /* -------------------------------------------- */
  /*  Observer Pool                               */
  /* -------------------------------------------- */

  const observerPool = buildTacticalPool({
    attribute: observerPerception,
    skill: observerAwareness,
    specialization: observerSpecialization,
    modifier: observerModifier
  });

  /* -------------------------------------------- */
  /*  Concealed Target Pool                       */
  /* -------------------------------------------- */

  const targetPool = buildTacticalPool({
    attribute: targetAgility,
    skill: targetStealth,
    specialization: targetSpecialization,
    modifier: targetModifier
  });

  /* -------------------------------------------- */
  /*  Roll Both Pools                             */
  /* -------------------------------------------- */

  const observerRoll = await rollTacticalPool({
    pool: observerPool.total,
    tn: 7,
    flavor: "Detection"
  });

  const targetRoll = await rollTacticalPool({
    pool: targetPool.total,
    tn: 7,
    flavor: "Concealment"
  });

  /* -------------------------------------------- */
  /*  Resolve Contest                             */
  /* -------------------------------------------- */

  const opposed = resolveTacticalOpposedRoll({
    activeSuccesses: observerRoll.successes,
    opposedSuccesses: targetRoll.successes,
    tiesFavorActive: false
  });

  return {
    detected: opposed.activeWins,

    observer: {
      pool: observerPool,
      roll: observerRoll
    },

    target: {
      pool: targetPool,
      roll: targetRoll
    },

    opposed
  };
}
