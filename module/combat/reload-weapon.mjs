/**
 * Tactical
 * Reload Weapon Helper
 *
 * Reload costs 1 Action during combat.
 *
 * Invalid reload attempts spend no Actions.
 * Outside combat, reload does not use the Action Economy.
 */

import {
  canSpendActions,
  spendActions
} from "./action-economy.mjs";

/* -------------------------------------------- */
/*  Combat Helpers                              */
/* -------------------------------------------- */

/**
 * Find this Actor's combatant in the
 * currently active Combat.
 *
 * @param {Actor} actor
 *
 * @returns {Combatant|null}
 */
function getActorCombatant(actor) {

  if (
    !actor ||
    !game.combat
  ) {
    return null;
  }

  return game.combat.combatants.find(
    combatant =>
      combatant.actor?.id === actor.id
  ) ?? null;
}

/**
 * Determine whether it is currently this
 * Actor's turn.
 *
 * @param {Actor} actor
 *
 * @returns {boolean}
 */
function isActorsTurn(actor) {

  if (
    !actor ||
    !game.combat?.combatant
  ) {
    return false;
  }

  return (
    game.combat.combatant.actor?.id ===
    actor.id
  );
}

/**
 * Reload a Tactical Weapon Item.
 *
 * @param {Item} weapon
 *
 * @returns {Promise<object>}
 */
export async function reloadWeapon(weapon) {

  /* -------------------------------------------- */
  /*  Weapon Validation                           */
  /* -------------------------------------------- */

  if (
    !weapon ||
    weapon.type !== "weapon"
  ) {
    throw new Error(
      "Tactical | Reload requires a Weapon Item."
    );
  }

  const system =
    weapon.system;

  const actor =
    weapon.actor ?? null;

  /* -------------------------------------------- */
  /*  Magazine Validation                         */
  /* -------------------------------------------- */

  if (
    system.usesMagazine === false
  ) {

    ui.notifications.info(
      `${weapon.name} does not use a magazine.`
    );

    return {
      success: false,
      reason: "no-magazine"
    };
  }

  const magazineCapacity =
    Math.max(
      0,
      Number(
        system.magazineCapacity
      ) || 0
    );

  const ammoBefore =
    Math.max(
      0,
      Number(
        system.ammoRemaining
      ) || 0
    );

  if (
    magazineCapacity <= 0
  ) {

    ui.notifications.warn(
      `${weapon.name} has no Magazine Capacity.`
    );

    return {
      success: false,
      reason: "zero-capacity"
    };
  }

  if (
    ammoBefore >= magazineCapacity
  ) {

    ui.notifications.info(
      `${weapon.name} is already fully loaded.`
    );

    return {
      success: false,
      reason: "already-full"
    };
  }

  /* -------------------------------------------- */
  /*  Determine Combat State                      */
  /* -------------------------------------------- */

  const combatant =
    actor
      ? getActorCombatant(actor)
      : null;

  const inCombat =
    combatant !== null;

  /* -------------------------------------------- */
  /*  Turn Validation                             */
  /* -------------------------------------------- */

  if (
    inCombat &&
    !isActorsTurn(actor)
  ) {

    ui.notifications.warn(
      `It is not ${actor.name}'s turn.`
    );

    return {
      success: false,
      reason: "not-turn"
    };
  }

  /* -------------------------------------------- */
  /*  Action Availability                         */
  /* -------------------------------------------- */

  if (
    inCombat &&
    !canSpendActions(
      actor,
      1
    )
  ) {

    ui.notifications.warn(
      `${actor.name} does not have enough Actions to Reload.`
    );

    return {
      success: false,
      reason: "no-actions"
    };
  }

  /* -------------------------------------------- */
  /*  Spend Reload Action                         */
  /* -------------------------------------------- */

  if (inCombat) {

    const actionState =
      await spendActions(
        actor,
        1,
        "Reload"
      );

    if (!actionState) {

      return {
        success: false,
        reason: "action-spend-failed"
      };
    }
  }

  /* -------------------------------------------- */
  /*  Reload Weapon                               */
  /* -------------------------------------------- */

  await weapon.update({
    "system.ammoRemaining":
      magazineCapacity
  });

  ui.notifications.info(
    `${weapon.name} reloaded.`
  );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    success: true,

    weaponId:
      weapon.id,

    actorId:
      actor?.id ?? null,

    actionCost:
      inCombat
        ? 1
        : 0,

    ammo: {
      before:
        ammoBefore,

      after:
        magazineCapacity,

      capacity:
        magazineCapacity
    }
  };
}
