/**
 * Tactical
 * Overwatch Action
 *
 * Entering Overwatch costs 1 Action.
 *
 * Overwatch remains active until:
 *
 * - the Actor makes its Overwatch Reaction shot,
 * - the Actor's next turn begins,
 * - or another rule explicitly removes it.
 *
 * The Reaction attack itself is handled separately.
 */

import {
  canSpendActions,
  spendActions
} from "./action-economy.mjs";

const FLAG_SCOPE =
  "tactical";

const FLAG_KEY =
  "overwatch";

/* -------------------------------------------- */
/*  Combat Helpers                              */
/* -------------------------------------------- */

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

/* -------------------------------------------- */
/*  Overwatch State                             */
/* -------------------------------------------- */

/**
 * Get the Actor's current Overwatch state.
 *
 * @param {Actor} actor
 *
 * @returns {object|null}
 */
export function getOverwatchState(actor) {

  if (!actor) {
    return null;
  }

  return actor.getFlag(
    FLAG_SCOPE,
    FLAG_KEY
  ) ?? null;
}

/**
 * Determine whether the Actor currently has
 * an active Overwatch state.
 *
 * @param {Actor} actor
 *
 * @returns {boolean}
 */
export function isActorOnOverwatch(actor) {

  const state =
    getOverwatchState(actor);

  return (
    state?.active === true
  );
}

/**
 * Clear the Actor's Overwatch state.
 *
 * @param {Actor} actor
 *
 * @returns {Promise<void>}
 */
export async function clearOverwatch(actor) {

  if (!actor) {
    return;
  }

  await actor.unsetFlag(
    FLAG_SCOPE,
    FLAG_KEY
  );
}

/* -------------------------------------------- */
/*  Enter Overwatch                             */
/* -------------------------------------------- */

/**
 * Enter Overwatch using a Weapon.
 *
 * @param {Actor} actor
 * Actor entering Overwatch.
 *
 * @param {Item} weapon
 * Weapon used for the eventual Reaction attack.
 *
 * @returns {Promise<object|null>}
 */
export async function enterOverwatch(
  actor,
  weapon
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Overwatch requires an Actor."
    );
  }

  if (
    !weapon ||
    weapon.type !== "weapon"
  ) {
    throw new Error(
      "Tactical | Overwatch requires a Weapon Item."
    );
  }

  const combatant =
    getActorCombatant(actor);

  if (!combatant) {

    ui.notifications.warn(
      "Overwatch can only be used during combat."
    );

    return null;
  }

  if (
    !isActorsTurn(actor)
  ) {

    ui.notifications.warn(
      `It is not ${actor.name}'s turn.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Weapon Validation                           */
  /* -------------------------------------------- */

  const weaponType =
    String(
      weapon.system.weaponType ?? ""
    ).toLowerCase();

  /*
   * Melee weapons cannot normally be placed
   * on Overwatch.
   */
  if (
    weaponType === "melee"
  ) {

    ui.notifications.warn(
      `${weapon.name} cannot be used for Overwatch.`
    );

    return null;
  }

  const usesMagazine =
    weapon.system.usesMagazine !== false;

  if (usesMagazine) {

    const ammo =
      Math.max(
        0,
        Number(
          weapon.system.ammoRemaining
        ) || 0
      );

    if (
      ammo <= 0
    ) {

      ui.notifications.warn(
        `${weapon.name} is out of ammunition.`
      );

      return null;
    }
  }

  /* -------------------------------------------- */
  /*  Action Validation                           */
  /* -------------------------------------------- */

  if (
    !canSpendActions(
      actor,
      1
    )
  ) {

    ui.notifications.warn(
      `${actor.name} does not have enough Actions to enter Overwatch.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Spend Overwatch Action                      */
  /* -------------------------------------------- */

  const actionState =
    await spendActions(
      actor,
      1,
      "Overwatch"
    );

  if (!actionState) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Store Overwatch State                       */
  /* -------------------------------------------- */

  const combat =
    game.combat;

  const state = {
    active:
      true,

    weaponId:
      weapon.id,

    weaponUuid:
      weapon.uuid,

    combatId:
      combat?.id ?? null,

    combatantId:
      combatant.id,

    round:
      Number(
        combat?.round
      ) || 0,

    turn:
      Number(
        combat?.turn
      ) || 0,

    reactionUsed:
      false
  };

  await actor.setFlag(
    FLAG_SCOPE,
    FLAG_KEY,
    state
  );

  ui.notifications.info(
    `${actor.name} is now on Overwatch with ${weapon.name}.`
  );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    success:
      true,

    actorId:
      actor.id,

    weaponId:
      weapon.id,

    weaponUuid:
      weapon.uuid,

    actionCost:
      1,

    overwatch:
      state
  };
}
