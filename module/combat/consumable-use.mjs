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
 * - consuming quantity
 *
 * Genre modules are responsible for interpreting
 * genre-specific consumable types and traits.
 */

/**
 * Use a Tactical Consumable Item.
 *
 * @param {Actor} actor
 * Actor using the Consumable.
 *
 * @param {Item} consumable
 * Consumable Item being used.
 *
 * @returns {Promise<object|null>}
 */
export async function useConsumable(
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

  const quantityBefore =
    Math.max(
      0,
      Number(
        system.quantity
      ) || 0
    );

  if (
    system.consumedOnUse !== false &&
    quantityBefore <= 0
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
  /*  Consume Quantity                            */
  /* -------------------------------------------- */

  let quantityAfter =
    quantityBefore;

  if (
    system.consumedOnUse !== false
  ) {

    quantityAfter =
      Math.max(
        0,
        quantityBefore - 1
      );

    await consumable.update({
      "system.quantity":
        quantityAfter
    });
  }

  /* -------------------------------------------- */
  /*  Result                                      */
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

    consumedOnUse:
      system.consumedOnUse !== false,

    quantity: {
      before:
        quantityBefore,

      after:
        quantityAfter
    },

    effect,

    traits
  };
}
