/**
 * Tactical
 * Bleeding Out Check
 *
 * Runs a Bleeding Out check for an Actor and
 * applies the resulting Wounds and statuses.
 */

import {
  resolveBleedingOut
} from "./bleeding-out-resolver.mjs";

import {
  applyTacticalStatus,
  removeTacticalStatus,
  hasTacticalStatus
} from "../status/foundry-status-effects.mjs";

/**
 * Perform a Bleeding Out check for an Actor.
 *
 * Success:
 * - Remove Bleeding Out
 * - Apply Stable
 * - Remain Unconscious
 *
 * Failure:
 * - Gain 1 Wound
 * - Remain Bleeding Out
 * - Remain Unconscious
 *
 * Failure reaching Max Wounds:
 * - Remove Bleeding Out
 * - Remove Stable
 * - Remove Unconscious
 * - Apply Dead
 *
 * @param {Actor} actor
 *
 * @returns {Promise<object|null>}
 */
export async function rollActorBleedingOut(
  actor
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Bleeding Out checks require an Actor."
    );
  }

  if (
    actor.type === "trooper" ||
    actor.type === "vehicle"
  ) {

    ui.notifications.warn(
      `${actor.name} cannot make Bleeding Out checks.`
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

  /* -------------------------------------------- */
  /*  Current State                               */
  /* -------------------------------------------- */

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

  if (
    hasTacticalStatus(
      actor,
      "dead"
    )
  ) {

    ui.notifications.warn(
      `${actor.name} is already Dead.`
    );

    return null;
  }

  if (
    hasTacticalStatus(
      actor,
      "stable"
    )
  ) {

    ui.notifications.info(
      `${actor.name} is already Stable.`
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
  /*  Check                                       */
  /* -------------------------------------------- */

  const result =
    await resolveBleedingOut({
      currentWounds,

      maxWounds,

      flavor:
        `${actor.name}: Bleeding Out`
    });

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
  /*  Death                                       */
  /* -------------------------------------------- */

  if (result.dead) {

    await removeTacticalStatus(
      actor,
      "bleeding-out"
    );

    await removeTacticalStatus(
      actor,
      "stable"
    );

    await removeTacticalStatus(
      actor,
      "unconscious"
    );

    await applyTacticalStatus(
      actor,
      "dead"
    );

    ui.notifications.info(
      `${actor.name} has died.`
    );

    return result;
  }

  /* -------------------------------------------- */
  /*  Stable                                      */
  /* -------------------------------------------- */

  if (result.stable) {

    await removeTacticalStatus(
      actor,
      "bleeding-out"
    );

    await applyTacticalStatus(
      actor,
      "stable"
    );

    /*
     * Stable characters remain unconscious
     * while still at 0 Health.
     */
    await applyTacticalStatus(
      actor,
      "unconscious"
    );

    ui.notifications.info(
      `${actor.name} is Stable.`
    );

    return result;
  }

  /* -------------------------------------------- */
  /*  Failed Check                                */
  /* -------------------------------------------- */

  await removeTacticalStatus(
    actor,
    "stable"
  );

  await applyTacticalStatus(
    actor,
    "unconscious"
  );

  await applyTacticalStatus(
    actor,
    "bleeding-out"
  );

  ui.notifications.warn(
    `${actor.name} failed their Bleeding Out check and gained 1 Wound.`
  );

  return result;
}
