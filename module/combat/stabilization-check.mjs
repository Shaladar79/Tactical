/**
 * Tactical
 * Stabilization Check
 *
 * Applies the result of a Medicine stabilization
 * attempt to a real Actor.
 */

import {
  resolveTacticalStabilization
} from "./stabilization-resolver.mjs";

import {
  applyTacticalStatus,
  removeTacticalStatus,
  hasTacticalStatus
} from "../status/foundry-status-effects.mjs";

/**
 * Apply stabilization successes to an Actor.
 *
 * The actual Medicine roll is handled elsewhere.
 *
 * Rules:
 *
 * 0 Successes
 * - Target remains Bleeding Out.
 *
 * 1 Success
 * - Target becomes Stable.
 * - Bleeding Out is removed.
 * - Target remains Unconscious while at 0 Health.
 *
 * Additional Successes
 * - Remove 1 Wound per extra Success.
 *
 * Dead targets cannot be stabilized.
 *
 * @param {Actor} actor
 * @param {number} successes
 *
 * @returns {Promise<object|null>}
 */
export async function applyActorStabilization(
  actor,
  successes = 0
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Stabilization requires an Actor."
    );
  }

  if (
    actor.type === "trooper" ||
    actor.type === "vehicle"
  ) {

    ui.notifications.warn(
      `${actor.name} cannot be stabilized with normal Medicine rules.`
    );

    return null;
  }

  if (
    hasTacticalStatus(
      actor,
      "dead"
    )
  ) {

    ui.notifications.warn(
      `${actor.name} is Dead and cannot be stabilized.`
    );

    return null;
  }

  const system =
    actor.system;

  if (!system.wounds) {

    ui.notifications.warn(
      `${actor.name} does not use Wounds.`
    );

    return null;
  }

  const currentHealth =
    Math.max(
      0,
      Number(
        system.health?.value
      ) || 0
    );

  if (currentHealth > 0) {

    ui.notifications.warn(
      `${actor.name} is not at 0 Health.`
    );

    return null;
  }

  const currentWounds =
    Math.max(
      0,
      Number(
        system.wounds.value
      ) || 0
    );

  const maxWounds =
    Math.max(
      0,
      Number(
        system.wounds.max
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Resolve Stabilization                       */
  /* -------------------------------------------- */

  const result =
    resolveTacticalStabilization({
      successes,
      currentWounds,
      maxWounds
    });

  /* -------------------------------------------- */
  /*  Failed Attempt                              */
  /* -------------------------------------------- */

  if (!result.stabilized) {

    ui.notifications.warn(
      `${actor.name} was not stabilized.`
    );

    return result;
  }

  /* -------------------------------------------- */
  /*  Update Wounds                               */
  /* -------------------------------------------- */

  if (
    result.wounds.after !==
    currentWounds
  ) {

    await actor.update({
      "system.wounds.value":
        result.wounds.after
    });
  }

  /* -------------------------------------------- */
  /*  Apply Stable State                          */
  /* -------------------------------------------- */

  await removeTacticalStatus(
    actor,
    "bleeding-out"
  );

  await applyTacticalStatus(
    actor,
    "stable"
  );

  /*
   * Stable characters remain Unconscious
   * while they are still at 0 Health.
   */
  await applyTacticalStatus(
    actor,
    "unconscious"
  );

  /* -------------------------------------------- */
  /*  Result Notification                         */
  /* -------------------------------------------- */

  if (
    result.wounds.removed > 0
  ) {

    ui.notifications.info(
      `${actor.name} is Stable and recovered ${result.wounds.removed} Wound${result.wounds.removed === 1 ? "" : "s"}.`
    );
  }
  else {

    ui.notifications.info(
      `${actor.name} is Stable.`
    );
  }

  return result;
}
