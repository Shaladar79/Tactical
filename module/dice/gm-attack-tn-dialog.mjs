/**
 * Tactical
 * GM Attack Target Number Dialog
 *
 * Handles attack-specific TN modifiers:
 *
 * - Range
 * - Cover
 * - Flanking
 * - Elevation
 * - Situational modifiers
 * - Weapon range-profile overrides
 */

import {
  BASE_TN,
  RANGE_TN_MODIFIERS
} from "./tn-modifiers.mjs";

/**
 * Prompt the GM to approve an attack TN.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.actorName
 * @param {string} options.attackName
 * @param {number} options.baseTN
 * @param {number} options.dicePool
 *
 * Optional weapon-specific range overrides:
 *
 * {
 *   melee: null,
 *   short: 1,
 *   medium: 1,
 *   long: 0,
 *   extreme: 1
 * }
 *
 * null or undefined means:
 * use the normal Tactical modifier for that band.
 *
 * @param {object} options.rangeOverrides
 *
 * @returns {Promise<object|null>}
 */
export async function promptGMAttackTN({
  title = "Tactical Attack Approval",
  actorName = "Character",
  attackName = "Attack",
  baseTN = BASE_TN,
  dicePool = 0,
  rangeOverrides = {}
} = {}) {

  if (!game.user.isGM) {
    throw new Error(
      "Tactical | Attack TN dialog may only be opened by a GM."
    );
  }

  const startingTN = Math.max(
    2,
    Math.min(
      12,
      Number(baseTN) || BASE_TN
    )
  );

  const pool = Math.max(
    0,
    Number(dicePool) || 0
  );

  /* -------------------------------------------- */
  /*  Range Modifier Helper                       */
  /* -------------------------------------------- */

  const getRangeModifier = band => {

    const normalModifier =
      RANGE_TN_MODIFIERS[band] ?? 0;

    if (
      !Object.prototype.hasOwnProperty.call(
        rangeOverrides,
        band
      )
    ) {
      return normalModifier;
    }

    const override =
      rangeOverrides[band];

    /*
     * null / undefined means this weapon does not
     * override the normal Tactical modifier.
     */
    if (
      override === null ||
      override === undefined
    ) {
      return normalModifier;
    }

    const numericOverride =
      Number(override);

    /*
     * A real numeric 0 is a valid override.
     */
    return Number.isFinite(numericOverride)
      ? numericOverride
      : normalModifier;
  };

  const meleeModifier =
    getRangeModifier("melee");

  const shortModifier =
    getRangeModifier("short");

  const mediumModifier =
    getRangeModifier("medium");

  const longModifier =
    getRangeModifier("long");

  const extremeModifier =
    getRangeModifier("extreme");

  const formatModifier = value =>
    value >= 0
      ? `+${value}`
      : `${value}`;

  const formData =
    await foundry.applications.api.DialogV2.input({
      window: {
        title
      },

      content: `
        <div class="tactical-gm-attack-tn-dialog">

          <div class="tactical-roll-summary">

            <p>
              <strong>Attacker:</strong>
              ${actorName}
            </p>

            <p>
              <strong>Attack:</strong>
              ${attackName}
            </p>

            <p>
              <strong>Dice Pool:</strong>
              ${pool}d12
            </p>

            <p>
              <strong>Base TN:</strong>
              ${startingTN}
            </p>

          </div>

          <hr>

          <h3>Range</h3>

          <div class="form-group">

            <select name="rangeBand">

              <option value="melee">
                Melee (${formatModifier(meleeModifier)} TN)
              </option>

              <option value="short" selected>
                Short (${formatModifier(shortModifier)} TN)
              </option>

              <option value="medium">
                Medium (${formatModifier(mediumModifier)} TN)
              </option>

              <option value="long">
                Long (${formatModifier(longModifier)} TN)
              </option>

              <option value="extreme">
                Extreme (${formatModifier(extremeModifier)} TN)
              </option>

            </select>

          </div>

          <hr>

          <h3>Cover</h3>

          <div class="tn-modifier-group">

            <label>
              <input
                type="checkbox"
                name="lightCover"
              >
              Light Cover (+1 TN)
            </label>

            <label>
              <input
                type="checkbox"
                name="heavyCover"
              >
              Heavy Cover (+2 TN)
            </label>

          </div>

          <p class="hint">
            Heavy Cover takes precedence if both are selected.
            Flanking negates Cover against the flanking attacker.
          </p>

          <hr>

          <h3>Position</h3>

          <div class="tn-modifier-group">

            <label>
              <input
                type="checkbox"
                name="flanking"
              >
              Flanking (-1 TN and negates Cover)
            </label>

            <label>
              <input
                type="checkbox"
                name="higherElevation"
              >
              Attacker Higher Elevation (-1 TN)
            </label>

            <label>
              <input
                type="checkbox"
                name="lowerElevation"
              >
              Attacker Lower Elevation (+1 TN)
            </label>

          </div>

          <hr>

          <h3>Situational</h3>

          <div class="tn-modifier-group">

            <label>
              <input
                type="checkbox"
                name="situationalMinus2"
              >
              Major Advantage (-2 TN)
            </label>

            <label>
              <input
                type="checkbox"
                name="situationalMinus1"
              >
              Minor Advantage (-1 TN)
            </label>

            <label>
              <input
                type="checkbox"
                name="situationalPlus1"
              >
              Minor Difficulty (+1 TN)
            </label>

            <label>
              <input
                type="checkbox"
                name="situationalPlus2"
              >
              Major Difficulty (+2 TN)
            </label>

          </div>

        </div>
      `,

      ok: {
        label: "Approve Attack"
      },

      rejectClose: false,
      modal: true
    });

  if (!formData) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Range                                       */
  /* -------------------------------------------- */

  const rangeBand =
    formData.get("rangeBand") || "short";

  const rangeModifier =
    getRangeModifier(rangeBand);

  /* -------------------------------------------- */
  /*  Conditions                                  */
  /* -------------------------------------------- */

  const modifiers = {

    lightCover:
      formData.get("lightCover") === "on",

    heavyCover:
      formData.get("heavyCover") === "on",

    flanking:
      formData.get("flanking") === "on",

    higherElevation:
      formData.get("higherElevation") === "on",

    lowerElevation:
      formData.get("lowerElevation") === "on",

    situationalMinus2:
      formData.get("situationalMinus2") === "on",

    situationalMinus1:
      formData.get("situationalMinus1") === "on",

    situationalPlus1:
      formData.get("situationalPlus1") === "on",

    situationalPlus2:
      formData.get("situationalPlus2") === "on"
  };

  /* -------------------------------------------- */
  /*  Cover                                       */
  /* -------------------------------------------- */

  let coverModifier = 0;

  /*
   * Flanking removes Cover against this attacker.
   */
  if (!modifiers.flanking) {

    if (modifiers.heavyCover) {
      coverModifier = 2;
    }
    else if (modifiers.lightCover) {
      coverModifier = 1;
    }
  }

  /* -------------------------------------------- */
  /*  Flanking                                    */
  /* -------------------------------------------- */

  const flankingModifier =
    modifiers.flanking
      ? -1
      : 0;

  /* -------------------------------------------- */
  /*  Elevation                                   */
  /* -------------------------------------------- */

  let elevationModifier = 0;

  if (
    modifiers.higherElevation &&
    !modifiers.lowerElevation
  ) {
    elevationModifier = -1;
  }

  if (
    modifiers.lowerElevation &&
    !modifiers.higherElevation
  ) {
    elevationModifier = 1;
  }

  /* -------------------------------------------- */
  /*  Situational                                 */
  /* -------------------------------------------- */

  let situationalModifier = 0;

  if (modifiers.situationalMinus2) {
    situationalModifier -= 2;
  }

  if (modifiers.situationalMinus1) {
    situationalModifier -= 1;
  }

  if (modifiers.situationalPlus1) {
    situationalModifier += 1;
  }

  if (modifiers.situationalPlus2) {
    situationalModifier += 2;
  }

  /* -------------------------------------------- */
  /*  Final TN                                    */
  /* -------------------------------------------- */

  const tnModifier =
    rangeModifier +
    coverModifier +
    flankingModifier +
    elevationModifier +
    situationalModifier;

  const finalTN = Math.max(
    2,
    Math.min(
      12,
      startingTN + tnModifier
    )
  );

  return {
    approved: true,

    baseTN:
      startingTN,

    tnModifier,

    finalTN,

    range: {
      band:
        rangeBand,

      modifier:
        rangeModifier
    },

    modifiers,

    breakdown: {
      range:
        rangeModifier,

      cover:
        coverModifier,

      flanking:
        flankingModifier,

      elevation:
        elevationModifier,

      situational:
        situationalModifier
    }
  };
}
