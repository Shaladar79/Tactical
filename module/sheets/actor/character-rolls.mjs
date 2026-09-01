/**
 * Tactical
 * Character Sheet Roll Helpers
 *
 * Standard character rolls are assembled here.
 *
 * Flow:
 *
 * 1. Build the player's dice pool.
 * 2. Send the proposed roll to the GM.
 * 3. GM selects applicable TN modifiers.
 * 4. GM approves or cancels.
 * 5. If approved, roll against the GM-approved TN.
 */

import {
  buildTacticalPool
} from "../../dice/build-pool.mjs";

import {
  rollTacticalPool
} from "../../dice/tactical-roll.mjs";

import {
  requestGMTNApproval
} from "../../socket/roll-request-socket.mjs";

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
 * @param {string} options.flavor
 * Chat message flavor.
 *
 * @returns {Promise<object|null>}
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
  /*  Rank Die Validation                         */
  /* -------------------------------------------- */

  const availableRankDice =
    Math.max(
      0,
      Number(
        actor.system.rankDice?.value
      ) || 0
    );

  if (
    rankDie &&
    availableRankDice <= 0
  ) {

    ui.notifications.warn(
      `${actor.name} has no Rank Dice remaining.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Build Dice Pool                             */
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
  /*  Base Target Number                          */
  /* -------------------------------------------- */

  const startingTN = Math.max(
    2,
    Math.min(
      12,
      Number(baseTN) || 7
    )
  );

  /* -------------------------------------------- */
  /*  Request GM Approval                         */
  /* -------------------------------------------- */

  const approval =
    await requestGMTNApproval({
      actorName:
        actor.name,

      rollName:
        flavor,

      baseTN:
        startingTN,

      dicePool:
        poolData.total
    });

  /*
   * GM cancelled or rejected the roll.
   */
  if (!approval) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Spend Rank Die                              */
  /* -------------------------------------------- */

  /**
   * The Rank Die is only consumed after the GM
   * approves the roll.
   */
  if (rankDie) {

    await actor.update({
      "system.rankDice.value":
        Math.max(
          0,
          availableRankDice - 1
        )
    });
  }

  /* -------------------------------------------- */
  /*  Roll                                        */
  /* -------------------------------------------- */

  const result =
    await rollTacticalPool({
      pool:
        poolData.total,

      tn:
        approval.finalTN,

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

    specialization,
    rankDie,
    diceModifier,

    poolData,

    targetNumber: {
      base:
        approval.baseTN,

      modifier:
        approval.tnModifier,

      final:
        approval.finalTN,

      details: {
        ...(approval.modifiers ?? {})
      }
    }
  };
}
