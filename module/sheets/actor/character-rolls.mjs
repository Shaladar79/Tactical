/**
 * Tactical
 * Character Sheet Roll Helpers
 *
 * Standard character rolls are assembled here.
 *
 * TN modifiers are supplied separately by the GM
 * approval/modifier workflow.
 */

import {
  buildTacticalPool
} from "../../dice/build-pool.mjs";

import {
  rollTacticalPool
} from "../../dice/tactical-roll.mjs";

/**
 * Roll a standard character Attribute + Skill check.
 *
 * @param {Actor} actor
 *
 * @param {object} options
 *
 * @param {string} options.attributeId
 * Attribute used for the check.
 *
 * @param {string} options.skillId
 * Optional Skill used for the check.
 *
 * @param {boolean} options.specialization
 * Whether one applicable Specialization applies.
 *
 * @param {boolean} options.rankDie
 * Whether one Rank Die is being spent.
 *
 * @param {number} options.diceModifier
 * Other dice-pool modifiers.
 *
 * @param {number} options.baseTN
 * Base Target Number before GM modifiers.
 *
 * @param {number} options.tnModifier
 * Total TN modifier approved by the GM.
 *
 * @param {object} options.tnModifierDetails
 * Optional breakdown of the GM-selected TN modifiers.
 *
 * @param {string} options.flavor
 * Chat message flavor.
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

    baseTN = 7,
    tnModifier = 0,
    tnModifierDetails = {},

    flavor = "Tactical Check"
  } = {}
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor || actor.type !== "character") {
    throw new Error(
      "Tactical | Character checks require a character Actor."
    );
  }

  if (!attributeId) {
    throw new Error(
      "Tactical | Character checks require an Attribute."
    );
  }

  /* -------------------------------------------- */
  /*  Attribute                                   */
  /* -------------------------------------------- */

  const attribute =
    Math.max(
      0,
      Number(
        actor.system.attributes?.[attributeId]
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Skill                                       */
  /* -------------------------------------------- */

  const skill =
    skillId
      ? Math.max(
          0,
          Number(
            actor.system.skills?.[skillId]
          ) || 0
        )
      : 0;

  /* -------------------------------------------- */
  /*  Dice Pool                                   */
  /* -------------------------------------------- */

  const poolData =
    buildTacticalPool({
      attribute,
      skill,
      specialization,
      rankDie,
      modifier: diceModifier
    });

  /* -------------------------------------------- */
  /*  Target Number                               */
  /* -------------------------------------------- */

  const startingTN = Math.max(
    2,
    Math.min(
      12,
      Number(baseTN) || 7
    )
  );

  const approvedTNModifier =
    Number(tnModifier) || 0;

  const finalTN = Math.max(
    2,
    Math.min(
      12,
      startingTN + approvedTNModifier
    )
  );

  /* -------------------------------------------- */
  /*  Roll                                        */
  /* -------------------------------------------- */

  const result =
    await rollTacticalPool({
      pool: poolData.total,
      tn: finalTN,
      flavor
    });

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    ...result,

    actorId:
      actor.id,

    attributeId,
    skillId,

    poolData,

    targetNumber: {
      base: startingTN,
      modifier: approvedTNModifier,
      final: finalTN,

      /*
       * Stores exactly which options the GM
       * selected when approving the roll.
       *
       * Example:
       *
       * {
       *   difficultConditions: true,
       *   favorableConditions: false
       * }
       */
      details: {
        ...tnModifierDetails
      }
    }
  };
}
