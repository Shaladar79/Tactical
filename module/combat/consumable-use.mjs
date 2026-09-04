/**
 * Tactical
 * Consumable Use
 *
 * Generic Consumable Item handling for Tactical core.
 *
 * Tactical core is responsible for:
 *
 * - validating the Item
 * - checking quantity
 * - reading generic effect fields
 * - preparing a use transaction
 * - committing quantity consumption only after
 *   the effect successfully resolves
 *
 * Genre modules are responsible for interpreting
 * genre-specific consumable types and traits.
 */

import {
  canSpendActions,
  spendActions,
  refundActions
} from "./action-economy.mjs";

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

/**
 * Prepare use of a Tactical Consumable Item.
 *
 * This does NOT consume quantity
 * or spend Actions.
 *
 * @param {Actor} actor
 * Actor using the Consumable.
 *
 * @param {Item} consumable
 * Consumable Item being used.
 *
 * @returns {object|null}
 */
export function prepareConsumableUse(
  actor,
  consumable
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Consumable use requires an Actor."
    );
  }

  if (
    !consumable ||
    consumable.type !== "consumable"
  ) {

    throw new Error(
      "Tactical | Consumable use requires a Consumable Item."
    );
  }

  const system =
    consumable.system;

  /* -------------------------------------------- */
  /*  Combat / Action State                       */
  /* -------------------------------------------- */

  const combatant =
    getActorCombatant(actor);

  const inCombat =
    combatant !== null;

  const actionCost =
    Math.max(
      0,
      Number(
        system.actionCost
      ) || 0
    );

  if (
    inCombat &&
    !isActorsTurn(actor)
  ) {

    ui.notifications.warn(
      `It is not ${actor.name}'s turn.`
    );

    return null;
  }

  if (
    inCombat &&
    actionCost > 0 &&
    !canSpendActions(
      actor,
      actionCost
    )
  ) {

    ui.notifications.warn(
      `${actor.name} does not have enough Actions to use ${consumable.name}.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Quantity                                    */
  /* -------------------------------------------- */

  const quantity =
    Math.max(
      0,
      Number(
        system.quantity
      ) || 0
    );

  const consumedOnUse =
    system.consumedOnUse !== false;

  if (
    consumedOnUse &&
    quantity <= 0
  ) {

    ui.notifications.warn(
      `${consumable.name} has no uses remaining.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Generic Effect Data                         */
  /* -------------------------------------------- */

  const effect = {
    healing:
      Math.max(
        0,
        Number(
          system.healing
        ) || 0
      ),

    woundRemoval:
      Math.max(
        0,
        Number(
          system.woundRemoval
        ) || 0
      ),

    dps:
      Math.max(
        0,
        Number(
          system.dps
        ) || 0
      ),

    penetration:
      Math.max(
        0,
        Number(
          system.penetration
        ) || 0
      ),

    blastRadius:
      Math.max(
        0,
        Number(
          system.blastRadius
        ) || 0
      )
  };

  /* -------------------------------------------- */
  /*  Traits                                      */
  /* -------------------------------------------- */

  const traits =
    Array.isArray(
      system.traits
    )
      ? [
          ...system.traits
        ]
      : [];

  /* -------------------------------------------- */
  /*  Prepared Transaction                        */
  /* -------------------------------------------- */

  return {
    actorId:
      actor.id,

    actorUuid:
      actor.uuid,

    consumableId:
      consumable.id,

    consumableUuid:
      consumable.uuid,

    name:
      consumable.name,

    consumableType:
      system.consumableType ?? "",

    technologyType:
      system.technologyType ?? "",

    sourceModule:
      system.sourceModule ?? "tactical",

    actionCost,

    inCombat,

    consumedOnUse,

    quantity: {
      before:
        quantity
    },

    effect,

    traits
  };
}

/**
 * Commit a prepared Consumable use.
 *
 * Action cost and quantity are only committed
 * after the caller has successfully resolved
 * the Consumable effect.
 *
 * @param {Item} consumable
 * @param {object} preparedUse
 *
 * @returns {Promise<object|null>}
 */
export async function commitConsumableUse(
  consumable,
  preparedUse
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (
    !consumable ||
    consumable.type !== "consumable"
  ) {

    throw new Error(
      "Tactical | Consumable commit requires a Consumable Item."
    );
  }

  if (!preparedUse) {

    throw new Error(
      "Tactical | Consumable commit requires a prepared use transaction."
    );
  }

  if (
    preparedUse.consumableId !==
    consumable.id
  ) {

    throw new Error(
      "Tactical | Prepared Consumable transaction does not match this Item."
    );
  }

  /* -------------------------------------------- */
  /*  Action Commit                               */
  /* -------------------------------------------- */

  const actor =
    consumable.actor ?? null;

  const actionCost =
    Math.max(
      0,
      Number(
        preparedUse.actionCost
      ) || 0
    );

  if (
    preparedUse.inCombat &&
    !actor
  ) {

    ui.notifications.error(
      "Tactical | Could not determine the Actor using this Consumable."
    );

    return null;
  }

  if (
    preparedUse.inCombat &&
    !isActorsTurn(actor)
  ) {

    ui.notifications.warn(
      `It is not ${actor.name}'s turn.`
    );

    return null;
  }

  if (
    preparedUse.inCombat &&
    actionCost > 0 &&
    !canSpendActions(
      actor,
      actionCost
    )
  ) {

    ui.notifications.warn(
      `${actor.name} does not have enough Actions to use ${consumable.name}.`
    );

    return null;
  }

  if (
    preparedUse.inCombat &&
    actionCost > 0
  ) {

    const actionState =
      await spendActions(
        actor,
        actionCost,
        `Use ${consumable.name}`
      );

    if (!actionState) {
      return null;
    }
  }

  /* -------------------------------------------- */
  /*  No Consumption                              */
  /* -------------------------------------------- */

  if (
    preparedUse.consumedOnUse === false
  ) {

    return {
      ...preparedUse,

      committed:
        true,

      actionSpent:
        preparedUse.inCombat
          ? actionCost
          : 0,

      quantity: {
        before:
          preparedUse.quantity.before,

        after:
          preparedUse.quantity.before
      }
    };
  }

  /* -------------------------------------------- */
  /*  Re-Check Live Quantity                      */
  /* -------------------------------------------- */

  const quantityBefore =
    Math.max(
      0,
      Number(
        consumable.system.quantity
      ) || 0
    );

  if (
    quantityBefore <= 0
  ) {

    /*
     * Refund the Action if the quantity changed
     * between prepare and commit.
     */
    if (
      preparedUse.inCombat &&
      actionCost > 0
    ) {

      await refundActions(
        actor,
        actionCost
      );
    }

    ui.notifications.warn(
      `${consumable.name} has no uses remaining.`
    );

    return null;
  }

  const quantityAfter =
    Math.max(
      0,
      quantityBefore - 1
    );

  /* -------------------------------------------- */
  /*  Commit Quantity                             */
  /* -------------------------------------------- */

  await consumable.update({
    "system.quantity":
      quantityAfter
  });

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    ...preparedUse,

    committed:
      true,

    actionSpent:
      preparedUse.inCombat
        ? actionCost
        : 0,

    quantity: {
      before:
        quantityBefore,

      after:
        quantityAfter
    }
  };
}
