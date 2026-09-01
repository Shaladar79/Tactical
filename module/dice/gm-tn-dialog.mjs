/**
 * Tactical
 * GM Target Number Modifier Dialog
 *
 * The GM approves and modifies the Target Number
 * before a requested Tactical roll is resolved.
 *
 * Generic checks use additive TN modifier checkboxes.
 * Specialized rolls such as attacks can use their own
 * named modifier dialogs later.
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

          <h3>TN Modifiers</h3>

          <div class="tn-modifier-group">

            <label>
              <input
                type="checkbox"
                name="tnMinus3"
              >
              -3 TN
            </label>

            <label>
              <input
                type="checkbox"
                name="tnMinus2"
              >
              -2 TN
            </label>

            <label>
              <input
                type="checkbox"
                name="tnMinus1"
              >
              -1 TN
            </label>

          </div>

          <div class="tn-modifier-group">

            <label>
              <input
                type="checkbox"
                name="tnPlus1"
              >
              +1 TN
            </label>

            <label>
              <input
                type="checkbox"
                name="tnPlus2"
              >
              +2 TN
            </label>

            <label>
              <input
                type="checkbox"
                name="tnPlus3"
              >
              +3 TN
            </label>

          </div>

          <p class="hint">
            Check every modifier that applies.
            Checked modifiers are cumulative.
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
  /*  Selected Modifiers                          */
  /* -------------------------------------------- */

  const modifiers = {
    tnMinus3:
      formData.get("tnMinus3") === "on",

    tnMinus2:
      formData.get("tnMinus2") === "on",

    tnMinus1:
      formData.get("tnMinus1") === "on",

    tnPlus1:
      formData.get("tnPlus1") === "on",

    tnPlus2:
      formData.get("tnPlus2") === "on",

    tnPlus3:
      formData.get("tnPlus3") === "on"
  };

  /* -------------------------------------------- */
  /*  Calculate Modifier                          */
  /* -------------------------------------------- */

  let tnModifier = 0;

  if (modifiers.tnMinus3) {
    tnModifier -= 3;
  }

  if (modifiers.tnMinus2) {
    tnModifier -= 2;
  }

  if (modifiers.tnMinus1) {
    tnModifier -= 1;
  }

  if (modifiers.tnPlus1) {
    tnModifier += 1;
  }

  if (modifiers.tnPlus2) {
    tnModifier += 2;
  }

  if (modifiers.tnPlus3) {
    tnModifier += 3;
  }

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

    modifiers
  };
}
