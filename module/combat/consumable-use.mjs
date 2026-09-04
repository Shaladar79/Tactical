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

/**
 * Prepare use of a Tactical Consumable Item.
 *
 * This does NOT consume quantity.
 *
 * @param {Actor} actor
 * Actor using the Consumable.
 *
 * @param {Item} consumable
 * Consumable Item being used.
 *
 * @returns {object|null}
 */
import {
  canSpendActions,
  spendActions
} from "./action-economy.mjs";

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

    actionCost:
      Math.max(
        0,
        Number(
          system.actionCost
        ) || 0
      ),

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
 * Quantity is only reduced here, after the caller
 * has successfully resolved the Consumable effect.
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
  /*  No Consumption                              */
  /* -------------------------------------------- */

  if (
    preparedUse.consumedOnUse === false
  ) {

    return {
      ...preparedUse,

      committed:
        true,

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

  /*
   * Re-read the live Item value instead of trusting
   * the prepared transaction.
   *
   * This protects against another action changing
   * quantity between prepare and commit.
   */
  const quantityBefore =
    Math.max(
      0,
      Number(
        consumable.system.quantity
      ) || 0
    );

  if (quantityBefore <= 0) {

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
  /*  Commit                                      */
  /* -------------------------------------------- */

  await consumable.update({
    "system.quantity":
      quantityAfter
  });

  return {
    ...preparedUse,

    committed:
      true,

    quantity: {
      before:
        quantityBefore,

      after:
        quantityAfter
    }
  };
}
