/**
 * Tactical
 * Healing Application
 *
 * Applies normal biological Health healing to an Actor.
 *
 * This does not remove Wounds unless another rule
 * explicitly does so.
 */

import {
  resolveTacticalHealing
} from "./healing-resolver.mjs";

import {
  removeTacticalStatus,
  hasTacticalStatus
} from "../status/foundry-status-effects.mjs";

/**
 * Apply normal Health healing to an Actor.
 *
 * Rules:
 *
 * - Dead actors cannot receive normal healing.
 * - Vehicles use repair rules instead.
 * - Healing cannot exceed Max Health.
 * - If Health rises above 0:
 *   - remove Bleeding Out
 *   - remove Stable
 *   - remove Unconscious
 *
 * @param {Actor} actor
 * @param {number} healing
 *
 * @returns {Promise<object|null>}
 */
export async function applyActorHealing(
  actor,
  healing = 0
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Healing requires an Actor."
    );
  }

  if (
    actor.type === "vehicle"
  ) {

    ui.notifications.warn(
      `${actor.name} requires repair rather than biological healing.`
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
      `${actor.name} is Dead and cannot receive normal healing.`
    );

    return null;
  }

  const system =
    actor.system;

  if (!system.health) {

    ui.notifications.warn(
      `${actor.name} has no Health resource.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Current Health                              */
  /* -------------------------------------------- */

  const currentHealth =
    Math.max(
      0,
      Number(
        system.health.value
      ) || 0
    );

  const maxHealth =
    Math.max(
      0,
      Number(
        system.health.max
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Resolve Healing                             */
  /* -------------------------------------------- */

  const result =
    resolveTacticalHealing({
      currentHealth,
      maxHealth,
      healing
    });

  /* -------------------------------------------- */
  /*  No Healing                                  */
  /* -------------------------------------------- */

  if (
    result.health.healingApplied <= 0
  ) {

    ui.notifications.info(
      `${actor.name} recovered no Health.`
    );

    return result;
  }

  /* -------------------------------------------- */
  /*  Apply Health                                */
  /* -------------------------------------------- */

  await actor.update({
    "system.health.value":
      result.health.after
  });

  /* -------------------------------------------- */
  /*  Regain Consciousness                        */
  /* -------------------------------------------- */

  if (
    result.regainedConsciousness
  ) {

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
  }

  /* -------------------------------------------- */
  /*  Notification                                */
  /* -------------------------------------------- */

  if (
    result.regainedConsciousness
  ) {

    ui.notifications.info(
      `${actor.name} recovered ${result.health.healingApplied} Health and regained consciousness.`
    );
  }
  else {

    ui.notifications.info(
      `${actor.name} recovered ${result.health.healingApplied} Health.`
    );
  }

  return result;
}
