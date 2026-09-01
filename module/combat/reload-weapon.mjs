/**
 * Tactical
 * Reload Weapon Helper
 *
 * Reloading normally costs 1 Action.
 *
 * This helper only updates ammunition.
 * Turn/action economy enforcement can be added later.
 */

/**
 * Reload a Tactical Weapon Item.
 *
 * @param {Item} weapon
 *
 * @returns {Promise<object>}
 */
export async function reloadWeapon(weapon) {

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

  if (system.usesMagazine === false) {

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

  if (magazineCapacity <= 0) {

    ui.notifications.warn(
      `${weapon.name} has no Magazine Capacity.`
    );

    return {
      success: false,
      reason: "zero-capacity"
    };
  }

  if (ammoBefore >= magazineCapacity) {

    ui.notifications.info(
      `${weapon.name} is already fully loaded.`
    );

    return {
      success: false,
      reason: "already-full"
    };
  }

  await weapon.update({
    "system.ammoRemaining":
      magazineCapacity
  });

  ui.notifications.info(
    `${weapon.name} reloaded.`
  );

  return {
    success: true,

    weaponId:
      weapon.id,

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
