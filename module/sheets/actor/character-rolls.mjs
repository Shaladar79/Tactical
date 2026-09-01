/**
 * Tactical
 * Character Sheet Roll Helpers
 */

import { buildTacticalPool } from "../../dice/build-pool.mjs";
import { rollTacticalPool } from "../../dice/tactical-roll.mjs";

/**
 * Roll a standard character Attribute + Skill check.
 *
 * @param {Actor} actor
 * @param {object} options
 * @param {string} options.attributeId
 * @param {string} options.skillId
 * @param {boolean} options.specialization
 * @param {boolean} options.rankDie
 * @param {number} options.diceModifier
 * @param {number} options.tn
 * @param {string} options.flavor
 *
 * @returns {Promise<object>}
 */
export async function rollCharacterCheck(
  actor,
  {
    attributeId,
    skillId = "",
    specialization = false,
    rankDie = false,
    diceModifier = 0,
    tn = 7,
    flavor = "Tactical Check"
  } = {}
) {

  if (!actor || actor.type !== "character") {
    throw new Error(
      "Tactical | Character checks require a character Actor."
    );
  }

  const attribute =
    Number(
      actor.system.attributes?.[attributeId]
    ) || 0;

  const skill =
    skillId
      ? Number(
          actor.system.skills?.[skillId]
        ) || 0
      : 0;

  const poolData =
    buildTacticalPool({
      attribute,
      skill,
      specialization,
      rankDie,
      modifier: diceModifier
    });

  const result =
    await rollTacticalPool({
      pool: poolData.total,
      tn,
      flavor
    });

  return {
    ...result,

    actorId:
      actor.id,

    attributeId,
    skillId,

    poolData
  };
}
