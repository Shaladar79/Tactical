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
 * Roll a standard character Attribute or
 * Attribute + Skill check.
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

/**
 * Roll a character Attribute Save.
 *
 * Save Pool =
 *
 * Attribute
 * + General Attribute Save Bonus
 * + applicable Conditional Save Bonuses
 * + other dice modifiers
 * + optional Rank Die
 *
 * Save Resolution =
 *
 * Each die meeting or exceeding the Save TN
 * generates one success.
 *
 * The Save succeeds when:
 *
 * Successes >= Save Difficulty
 *
 * Specializations do not apply to Saves by default.
 *
 * @param {Actor} actor
 *
 * @param {object} options
 *
 * @param {string} options.attributeId
 * Attribute used for the Save.
 *
 * @param {number} options.conditionalBonus
 * Total applicable Conditional Save Bonuses.
 *
 * @param {boolean} options.rankDie
 * Whether one Rank Die is being spent.
 *
 * @param {number} options.diceModifier
 * Other dice-pool modifiers that are not Save Bonuses.
 *
 * @param {number} options.baseTN
 * Base Target Number before GM modifiers.
 *
 * @param {number} options.difficulty
 * Number of successes required to pass the Save.
 *
 * @param {string} options.flavor
 * Chat message flavor.
 *
 * @returns {Promise<object|null>}
 */
export async function rollCharacterSave(
  actor,
  {
    attributeId,

    conditionalBonus = 0,

    rankDie = false,

    diceModifier = 0,

    baseTN = 7,

    difficulty = 1,

    flavor = "Tactical Save"
  } = {}
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor || actor.type !== "character") {
    throw new Error(
      "Tactical | Character Saves require a character Actor."
    );
  }

  if (!attributeId) {
    throw new Error(
      "Tactical | Character Saves require an Attribute."
    );
  }

  const attributeValue =
    actor.system.attributes?.[
      attributeId
    ];

  if (attributeValue === undefined) {
    throw new Error(
      `Tactical | Unknown Save Attribute: ${attributeId}`
    );
  }

  /* -------------------------------------------- */
  /*  Save Difficulty                             */
  /* -------------------------------------------- */

  const saveDifficulty =
    Math.max(
      1,
      Math.floor(
        Number(difficulty) || 1
      )
    );

  /* -------------------------------------------- */
  /*  General Save Bonus                          */
  /* -------------------------------------------- */

  const generalSaveBonus =
    Math.max(
      0,
      Number(
        actor.system.saveBonuses?.[
          attributeId
        ]
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Conditional Save Bonuses                    */
  /* -------------------------------------------- */

  const conditionalSaveBonus =
    Math.max(
      0,
      Number(
        conditionalBonus
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Other Dice Modifiers                        */
  /* -------------------------------------------- */

  const otherDiceModifier =
    Number(
      diceModifier
    ) || 0;

  /*
   * General and Conditional Save Bonuses are
   * additional dice in the Save pool.
   *
   * They are passed through the shared character
   * check helper as part of its dice modifier.
   */
  const totalSaveModifier =
    generalSaveBonus +
    conditionalSaveBonus +
    otherDiceModifier;

  /* -------------------------------------------- */
  /*  Base Save Pool                              */
  /* -------------------------------------------- */

  const baseSavePool =
    Math.max(
      0,
      Number(
        attributeValue
      ) || 0
    ) +
    generalSaveBonus +
    conditionalSaveBonus;

  /* -------------------------------------------- */
  /*  Resolve Shared Character Roll               */
  /* -------------------------------------------- */

  const result =
    await rollCharacterCheck(
      actor,
      {
        attributeId,

        skillId:
          "",

        specialization:
          false,

        rankDie,

        diceModifier:
          totalSaveModifier,

        baseTN,

        flavor
      }
    );

  if (!result) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Save Resolution                             */
  /* -------------------------------------------- */

  const successes =
    Math.max(
      0,
      Number(result.successes) || 0
    );

  const passed =
    successes >= saveDifficulty;

  const failed =
    !passed;

  /* -------------------------------------------- */
  /*  Save Result                                 */
  /* -------------------------------------------- */

  return {
    ...result,

    save:
      true,

    saveBonus:
      generalSaveBonus,

    conditionalSaveBonus,

    saveDiceModifier:
      otherDiceModifier,

    totalSaveModifier,

    baseSavePool,

    difficulty:
      saveDifficulty,

    passed,

    failed
  };
}
