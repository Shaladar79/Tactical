/**
 * Tactical
 * Reload Weapon Helper
 *
 * Reload normally costs 1 Action during combat.
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

function getActorCombatant(actor) {

  const combat =
    game.combat;

  if (
    !combat ||
    !actor
  ) {
    return null;
  }

  return combat.combatants.find(
    combatant =>
      combatant.actor?.id === actor.id
  ) ?? null;
}

function isActorsTurn(actor) {

  const combatant =
    game.combat?.combatant;

  if (
    !combatant ||
    !actor
  ) {
    return false;
  }

  return (
    combatant.actor?.id === actor.id
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
  /*  Validation                                  */
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
  /*  Combat / Action Validation                  */
  /* -------------------------------------------- */

  const combatant =
    actor
      ? getActorCombatant(actor)
      : null;

  const inCombat =
    Boolean(combatant);

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

  if (
    inCombat &&
    !canSpendActions(
      actor,
      1
    )
  ) {

    ui.notifications.warn(
      `${actor.name} has no Actions remaining.`
    );

    return {
      success: false,
      reason: "no-actions"
    };
  }

  /* -------------------------------------------- */
  /*  Spend Action                                */
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
  /*  Reload                                      */
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
