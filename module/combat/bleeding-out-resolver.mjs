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
 * - Character becomes Stable.
 * - No Wound is gained.
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

  /* -------------------------------------------- */
  /*  Current Wounds                              */
  /* -------------------------------------------- */

  const woundsBefore =
    Math.max(
      0,
      Number(currentWounds) || 0
    );

  const woundMaximum =
    Math.max(
      0,
      Number(maxWounds) || 0
    );

  /* -------------------------------------------- */
  /*  Target Number                               */
  /* -------------------------------------------- */

  const targetNumber =
    9 + woundsBefore;

  /* -------------------------------------------- */
  /*  Roll                                        */
  /* -------------------------------------------- */

  const roll =
    await new Roll(
      "1d12"
    ).evaluate();

  const result =
    Number(
      roll.total
    ) || 0;

  const success =
    result >= targetNumber;

  /* -------------------------------------------- */
  /*  Wound Result                                */
  /* -------------------------------------------- */

  const woundsApplied =
    success
      ? 0
      : 1;

  const woundsAfter =
    Math.min(
      woundMaximum,
      woundsBefore +
        woundsApplied
    );

  const dead =
    woundMaximum > 0 &&
    woundsAfter >= woundMaximum;

  /* -------------------------------------------- */
  /*  Stable Result                               */
  /* -------------------------------------------- */

  /*
   * A successful Bleeding Out check stabilizes
   * the character unless they are already dead.
   */
  const stable =
    success &&
    !dead;

  /* -------------------------------------------- */
  /*  Chat Result                                 */
  /* -------------------------------------------- */

  let resultText;

  if (dead) {
    resultText =
      "Failure | +1 Wound | Dead";
  }
  else if (stable) {
    resultText =
      "Success | Stable";
  }
  else {
    resultText =
      "Failure | +1 Wound";
  }

  await roll.toMessage({
    flavor:
      `${flavor}<br>` +
      `TN ${targetNumber} | ` +
      resultText
  });

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    roll,

    result,

    tn:
      targetNumber,

    success,

    stable,

    wounds: {
      before:
        woundsBefore,

      applied:
        woundsApplied,

      after:
        woundsAfter,

      max:
        woundMaximum
    },

    dead
  };
}
