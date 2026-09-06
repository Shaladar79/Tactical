/**
 * Tactical
 * Generic Actor Save Helper
 *
 * Provides shared Save resolution for any Tactical
 * Actor that uses:
 *
 * system.attributes
 * system.saveBonuses
 *
 * Supported by design:
 * character
 * trooper
 * lieutenant
 * commander
 * overlord
 */

import {
  buildTacticalPool
} from "./build-pool.mjs";

import {
  rollTacticalPool
} from "./tactical-roll.mjs";

import {
  requestGMTNApproval
} from "../socket/roll-request-socket.mjs";

/**
 * Roll a Tactical Actor Attribute Save.
 *
 * Save Pool =
 *
 * Attribute
 * + General Attribute Save Bonus
 * + applicable Conditional Save Bonuses
 * + other dice modifiers
 * + optional Rank Die
 *
 * Save succeeds when:
 *
 * Successes >= Save Difficulty
 *
 * Specializations do not apply to Saves.
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
 * Actors without a Rank Dice resource cannot
 * spend a Rank Die.
 *
 * @param {number} options.diceModifier
 * Other dice-pool modifiers.
 *
 * @param {number} options.baseTN
 * Base Save Target Number before GM modifiers.
 *
 * @param {number} options.difficulty
 * Number of successes required to pass.
 *
 * @param {string} options.flavor
 * Chat message flavor.
 *
 * @returns {Promise<object|null>}
 */
export async function rollActorSave(
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

  if (!actor?.system) {

    throw new Error(
      "Tactical | Saves require a valid Actor."
    );
  }

  if (!attributeId) {

    throw new Error(
      "Tactical | Saves require an Attribute."
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
  /*  Attribute                                   */
  /* -------------------------------------------- */

  const attribute =
    Math.max(
      0,
      Number(attributeValue) || 0
    );

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
  /*  Conditional Save Bonus                      */
  /* -------------------------------------------- */

  const conditionalSaveBonus =
    Math.max(
      0,
      Number(
        conditionalBonus
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Other Dice Modifier                         */
  /* -------------------------------------------- */

  const otherDiceModifier =
    Number(
      diceModifier
    ) || 0;

  const totalSaveModifier =
    generalSaveBonus +
    conditionalSaveBonus +
    otherDiceModifier;

  /* -------------------------------------------- */
  /*  Rank Die                                    */
  /* -------------------------------------------- */

  const hasRankDiceResource =
    actor.system.rankDice !== undefined &&
    actor.system.rankDice !== null;

  const availableRankDice =
    hasRankDiceResource
      ? Math.max(
          0,
          Number(
            actor.system.rankDice?.value
          ) || 0
        )
      : 0;

  if (
    rankDie &&
    !hasRankDiceResource
  ) {

    ui.notifications.warn(
      `${actor.name} does not use Rank Dice.`
    );

    return null;
  }

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
  /*  Build Save Pool                             */
  /* -------------------------------------------- */

  const poolData =
    buildTacticalPool({
      attribute,

      skill:
        0,

      specialization:
        false,

      rankDie,

      modifier:
        totalSaveModifier
    });

  /* -------------------------------------------- */
  /*  Base Save Pool                              */
  /* -------------------------------------------- */

  const baseSavePool =
    attribute +
    generalSaveBonus +
    conditionalSaveBonus;

  /* -------------------------------------------- */
  /*  Base Target Number                          */
  /* -------------------------------------------- */

  const startingTN =
    Math.max(
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

  if (!approval) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Spend Rank Die                              */
  /* -------------------------------------------- */

  /*
   * Rank Dice are only spent after GM approval.
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
  /*  Save Resolution                             */
  /* -------------------------------------------- */

  const successes =
    Math.max(
      0,
      Number(
        result.successes
      ) || 0
    );

  const passed =
    successes >= saveDifficulty;

  const failed =
    !passed;

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    ...result,

    save:
      true,

    actorId:
      actor.id,

    actorType:
      actor.type,

    attributeId,

    attribute,

    saveBonus:
      generalSaveBonus,

    conditionalSaveBonus,

    saveDiceModifier:
      otherDiceModifier,

    totalSaveModifier,

    baseSavePool,

    poolData,

    rankDie,

    difficulty:
      saveDifficulty,

    passed,

    failed,

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
