/**
 * Tactical
 * Stabilize Action
 *
 * Performs a Medicine stabilization attempt against
 * one targeted Actor.
 *
 * Flow:
 *
 * 1. Require one target.
 * 2. Validate that the target can be stabilized.
 * 3. Build the acting character's Focus + Medicine pool.
 * 4. Open the normal player roll-options dialog.
 * 5. Send the check to the GM for TN approval.
 * 6. Roll Medicine.
 * 7. Apply the resulting Successes to the target.
 */

import {
  rollCharacterCheck
} from "../sheets/actor/character-rolls.mjs";

import {
  promptTacticalRoll
} from "../dice/roll-dialog.mjs";

import {
  applyActorStabilization
} from "./stabilization-check.mjs";

import {
  hasTacticalStatus
} from "../status/foundry-status-effects.mjs";

/**
 * Perform a Stabilize Action.
 *
 * Default Tactical pairing:
 *
 * Focus + Medicine
 *
 * @param {Actor} actor
 * Character performing stabilization.
 *
 * @returns {Promise<object|null>}
 */
export async function performStabilizeAction(
  actor
) {

  /* -------------------------------------------- */
  /*  Validate Acting Character                   */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Stabilize requires an acting Actor."
    );
  }

  /* -------------------------------------------- */
  /*  Target                                      */
  /* -------------------------------------------- */

  const targets =
    Array.from(
      game.user.targets ?? []
    );

  if (targets.length === 0) {

    ui.notifications.warn(
      "Target a character before attempting Stabilize."
    );

    return null;
  }

  if (targets.length > 1) {

    ui.notifications.warn(
      "Stabilize requires exactly one target."
    );

    return null;
  }

  const targetToken =
    targets[0];

  const targetActor =
    targetToken.actor;

  if (!targetActor) {

    ui.notifications.warn(
      "The targeted token has no Actor."
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Target Validation                           */
  /* -------------------------------------------- */

  if (
    targetActor.type === "trooper" ||
    targetActor.type === "vehicle"
  ) {

    ui.notifications.warn(
      `${targetActor.name} cannot be stabilized with normal Medicine rules.`
    );

    return null;
  }

  if (
    hasTacticalStatus(
      targetActor,
      "dead"
    )
  ) {

    ui.notifications.warn(
      `${targetActor.name} is Dead and cannot be stabilized.`
    );

    return null;
  }

  const targetHealth =
    Math.max(
      0,
      Number(
        targetActor.system.health?.value
      ) || 0
    );

  if (targetHealth > 0) {

    ui.notifications.warn(
      `${targetActor.name} is not at 0 Health.`
    );

    return null;
  }

  if (
    hasTacticalStatus(
      targetActor,
      "stable"
    )
  ) {

    ui.notifications.info(
      `${targetActor.name} is already Stable.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Medicine Pool                               */
  /* -------------------------------------------- */

  const attributeId =
    "focus";

  const skillId =
    "medicine";

  const attributeValue =
    Math.max(
      0,
      Number(
        actor.system.attributes?.[
          attributeId
        ]
      ) || 0
    );

  const skillValue =
    Math.max(
      0,
      Number(
        actor.system.skills?.[
          skillId
        ]
      ) || 0
    );

  const basePool =
    attributeValue +
    skillValue;

  const availableRankDice =
    Math.max(
      0,
      Number(
        actor.system.rankDice?.value
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Player Options                              */
  /* -------------------------------------------- */

  const flavor =
    `${actor.name}: Stabilize ${targetActor.name}`;

  const options =
    await promptTacticalRoll({
      title:
        flavor,

      basePool,

      baseTN:
        7,

      availableRankDice
    });

  if (!options) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Medicine Check                              */
  /* -------------------------------------------- */

  const checkResult =
    await rollCharacterCheck(
      actor,
      {
        attributeId,
        skillId,

        specialization:
          options.specialization,

        rankDie:
          options.rankDie,

        diceModifier:
          options.diceModifier,

        baseTN:
          7,

        flavor
      }
    );

  if (!checkResult) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Extract Successes                           */
  /* -------------------------------------------- */

  const successes =
    Math.max(
      0,
      Number(
        checkResult.roll?.successes
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Apply Stabilization                         */
  /* -------------------------------------------- */

  const stabilization =
    await applyActorStabilization(
      targetActor,
      successes
    );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    actorId:
      actor.id,

    targetId:
      targetActor.id,

    targetName:
      targetActor.name,

    check:
      checkResult,

    successes,

    stabilization
  };
}
