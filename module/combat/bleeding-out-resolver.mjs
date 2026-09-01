/**
 * Tactical
 * Bleeding Out Resolver
 *
 * Handles Bleeding Out checks for characters at 0 Health.
 */

/**
 * Resolve a Bleeding Out check.
 *
 * Rule:
 * Roll 1d12 against TN = 9 + current Wounds Taken.
 *
 * Success:
 * - Character remains alive.
 *
 * Failure:
 * - Character gains 1 Wound.
 *
 * Death:
 * - Occurs when Wounds Taken reaches Max Wounds.
 *
 * @param {object} options
 * @param {number} options.currentWounds
 * @param {number} options.maxWounds
 * @param {string} options.flavor
 *
 * @returns {Promise<object>}
 */
export async function resolveBleedingOut({
  currentWounds = 0,
  maxWounds = 0,
  flavor = "Bleeding Out"
} = {}) {

  const woundsBefore = Math.max(
    0,
    Number(currentWounds) || 0
  );

  const woundMaximum = Math.max(
    0,
    Number(maxWounds) || 0
  );

  const targetNumber =
    9 + woundsBefore;

  const roll = await new Roll("1d12").evaluate();

  const result =
    roll.total ?? 0;

  const success =
    result >= targetNumber;

  const woundsApplied =
    success ? 0 : 1;

  const woundsAfter = Math.min(
    woundMaximum,
    woundsBefore + woundsApplied
  );

  const dead =
    woundMaximum > 0 &&
    woundsAfter >= woundMaximum;

  await roll.toMessage({
    flavor:
      `${flavor}<br>` +
      `TN ${targetNumber} | ` +
      `${success ? "Success" : "Failure"}` +
      `${woundsApplied > 0 ? " | +1 Wound" : ""}` +
      `${dead ? " | Dead" : ""}`
  });

  return {
    roll,
    result,
    tn: targetNumber,
    success,

    wounds: {
      before: woundsBefore,
      applied: woundsApplied,
      after: woundsAfter,
      max: woundMaximum
    },

    dead
  };
}
