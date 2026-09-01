/**
 * Tactical
 * Foundry Status Effects
 *
 * Bridges Tactical's core Status Registry into
 * Foundry VTT's CONFIG.statusEffects system.
 *
 * The Tactical registry remains the authoritative
 * source for status names and descriptions.
 */

/**
 * Default Foundry icons for Tactical statuses.
 *
 * These use Foundry core SVG assets for now.
 * Tactical-specific artwork can replace them later
 * without changing the status IDs or rules.
 */
const STATUS_ICONS = {
  bleeding:
    "icons/svg/blood.svg",

  "bleeding-out":
    "icons/svg/skull.svg",

  burning:
    "icons/svg/fire.svg",

  poisoned:
    "icons/svg/poison.svg",

  disoriented:
    "icons/svg/daze.svg",

  stunned:
    "icons/svg/daze.svg",

  prone:
    "icons/svg/falling.svg",

  immobilized:
    "icons/svg/net.svg",

  suppressed:
    "icons/svg/target.svg",

  concealed:
    "icons/svg/invisible.svg",

  stable:
    "icons/svg/regen.svg",

  unconscious:
    "icons/svg/unconscious.svg",

  dead:
    "icons/svg/skull.svg",

  defeated:
    "icons/svg/downgrade.svg",

  disabled:
    "icons/svg/hazard.svg"
};

/**
 * Register Tactical statuses with Foundry.
 *
 * @param {TacticalStatusRegistry} statusRegistry
 */
export function registerFoundryStatusEffects(
  statusRegistry
) {

  if (!statusRegistry) {
    throw new Error(
      "Tactical | Foundry Status Effects require the Tactical Status Registry."
    );
  }

  const tacticalStatuses =
    statusRegistry.getAll();

  const existingStatuses =
    CONFIG.statusEffects ?? {};

  const normalizedStatuses =
    Array.isArray(existingStatuses)
      ? Object.fromEntries(
          existingStatuses
            .filter(
              status =>
                status?.id
            )
            .map(
              status => [
                status.id,
                status
              ]
            )
        )
      : {
          ...existingStatuses
        };

  for (const status of tacticalStatuses) {

    const id =
      status.id;

    if (!id) {
      continue;
    }

    normalizedStatuses[id] = {
      id,

      name:
        status.name,

      img:
        STATUS_ICONS[id] ??
        "icons/svg/aura.svg"
    };
  }

  CONFIG.statusEffects =
    normalizedStatuses;

  console.log(
    `Tactical | Registered ${tacticalStatuses.length} Foundry Status Effects`
  );
}

/**
 * Apply a Tactical status to an Actor.
 *
 * Safe to call when the status is already active.
 *
 * @param {Actor} actor
 * @param {string} statusId
 *
 * @returns {Promise<void>}
 */
export async function applyTacticalStatus(
  actor,
  statusId
) {

  if (!actor) {
    throw new Error(
      "Tactical | Applying a status requires an Actor."
    );
  }

  if (!statusId) {
    throw new Error(
      "Tactical | Applying a status requires a Status ID."
    );
  }

  const status =
    CONFIG.statusEffects?.[
      statusId
    ];

  if (!status) {

    ui.notifications.warn(
      `Tactical | Unknown Status Effect: ${statusId}`
    );

    return;
  }

  await actor.toggleStatusEffect(
    statusId,
    {
      active: true
    }
  );
}

/**
 * Remove a Tactical status from an Actor.
 *
 * Safe to call when the status is already absent.
 *
 * @param {Actor} actor
 * @param {string} statusId
 *
 * @returns {Promise<void>}
 */
export async function removeTacticalStatus(
  actor,
  statusId
) {

  if (!actor) {
    throw new Error(
      "Tactical | Removing a status requires an Actor."
    );
  }

  if (!statusId) {
    throw new Error(
      "Tactical | Removing a status requires a Status ID."
    );
  }

  await actor.toggleStatusEffect(
    statusId,
    {
      active: false
    }
  );
}

/**
 * Determine whether an Actor currently has
 * a Tactical status.
 *
 * @param {Actor} actor
 * @param {string} statusId
 *
 * @returns {boolean}
 */
export function hasTacticalStatus(
  actor,
  statusId
) {

  if (
    !actor ||
    !statusId
  ) {
    return false;
  }

  return actor.statuses?.has(
    statusId
  ) ?? false;
}
