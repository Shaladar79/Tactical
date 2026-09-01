/**
 * Tactical
 * GM Target Number Modifier Dialog
 *
 * The GM approves and modifies the Target Number
 * before a requested Tactical roll is resolved.
 *
 * Common Tactical conditions are represented by
 * named checkboxes.
 */

/**
 * Prompt the GM to approve a Target Number and select
 * any applicable TN modifiers.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.actorName
 * @param {string} options.rollName
 * @param {number} options.baseTN
 * @param {number} options.dicePool
 *
 * @returns {Promise<object|null>}
 * Returns null if the GM cancels the roll.
 */
export async function promptGMTNModifiers({
  title = "Tactical Roll Approval",
  actorName = "Character",
  rollName = "Tactical Check",
  baseTN = 7,
  dicePool = 0
} = {}) {

  if (!game.user.isGM) {
    throw new Error(
      "Tactical | GM TN modifier dialog may only be opened by a GM."
    );
  }

  const startingTN = Math.max(
    2,
    Math.min(
      12,
      Number(baseTN) || 7
    )
  );

  const pool = Math.max(
    0,
    Number(dicePool) || 0
  );

  const formData =
    await foundry.applications.api.DialogV2.input({
      window: {
        title
      },

      content: `
        <div class="tactical-gm-tn-dialog">

          <div class="tactical-roll-summary">

            <p>
              <strong>Character:</strong>
              ${actorName}
            </p>

            <p>
              <strong>Roll:</strong>
              ${rollName}
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
            Use only one Cover option.
            Heavy Cover takes precedence if both are checked.
          </p>

          <hr>

          <h3>Position</h3>

          <div class="tn-modifier-group">

            <label>
              <input
                type="checkbox"
                name="flanking"
              >
              Flanking (-1 TN)
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

          <p class="hint">
            Higher and Lower Elevation cannot normally both apply.
          </p>

          <hr>

          <h3>Situational Modifiers</h3>

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

          <p class="hint">
            Situational modifiers are cumulative.
          </p>

        </div>
      `,

      ok: {
        label: "Approve Roll"
      },

      rejectClose: false,
      modal: true
    });

  /* -------------------------------------------- */
  /*  Cancelled                                   */
  /* -------------------------------------------- */

  if (!formData) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Read Selected Conditions                    */
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
  /*  Cover Modifier                              */
  /* -------------------------------------------- */

  let coverModifier = 0;

  if (modifiers.heavyCover) {
    coverModifier = 2;
  }
  else if (modifiers.lightCover) {
    coverModifier = 1;
  }

  /* -------------------------------------------- */
  /*  Flanking Modifier                           */
  /* -------------------------------------------- */

  const flankingModifier =
    modifiers.flanking
      ? -1
      : 0;

  /* -------------------------------------------- */
  /*  Elevation Modifier                          */
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
  /*  Situational Modifier                        */
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
  /*  Total TN Modifier                           */
  /* -------------------------------------------- */

  const tnModifier =
    coverModifier +
    flankingModifier +
    elevationModifier +
    situationalModifier;

  /* -------------------------------------------- */
  /*  Final TN                                    */
  /* -------------------------------------------- */

  const finalTN = Math.max(
    2,
    Math.min(
      12,
      startingTN + tnModifier
    )
  );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    approved: true,

    baseTN:
      startingTN,

    tnModifier,

    finalTN,

    modifiers,

    breakdown: {
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
