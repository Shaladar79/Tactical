/**
 * Tactical
 * Pre-Roll Configuration Dialog
 *
 * Allows a player to configure their side of a Tactical roll:
 *
 * - Applicable Specialization, when allowed
 * - Rank Die expenditure
 * - Temporary dice-pool modifier
 * - Save Difficulty, when enabled
 *
 * Target Number modifiers are controlled separately by the GM.
 */

/**
 * Open a Tactical pre-roll dialog.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {number} options.basePool
 * @param {number} options.baseTN
 * @param {number} options.availableRankDice
 * @param {boolean} options.allowSpecialization
 * Whether the roll may use a Specialization.
 *
 * @param {boolean} options.allowDifficulty
 * Whether the roll uses Save Difficulty.
 *
 * @param {number} options.baseDifficulty
 * Number of successes required when Difficulty is enabled.
 *
 * @returns {Promise<object|null>}
 * Returns null if the roll is cancelled.
 */
export async function promptTacticalRoll({
  title = "Tactical Roll",
  basePool = 0,
  baseTN = 7,
  availableRankDice = 0,
  allowSpecialization = true,
  allowDifficulty = false,
  baseDifficulty = 1
} = {}) {

  const startingPool = Math.max(
    0,
    Number(basePool) || 0
  );

  const startingTN = Math.max(
    2,
    Math.min(
      12,
      Number(baseTN) || 7
    )
  );

  const rankDiceAvailable = Math.max(
    0,
    Number(availableRankDice) || 0
  );

  const startingDifficulty =
    Math.max(
      1,
      Math.floor(
        Number(baseDifficulty) || 1
      )
    );

  /* -------------------------------------------- */
  /*  Optional Specialization                     */
  /* -------------------------------------------- */

  const specializationContent =
    allowSpecialization
      ? `
          <div class="form-group">

            <label for="specialization">
              Applicable Specialization
            </label>

            <input
              id="specialization"
              name="specialization"
              type="checkbox"
            >

            <p class="hint">
              Adds +1d12. Only one Specialization may apply to a roll.
            </p>

          </div>
        `
      : "";

  /* -------------------------------------------- */
  /*  Optional Save Difficulty                    */
  /* -------------------------------------------- */

  const difficultyContent =
    allowDifficulty
      ? `
          <div class="form-group">

            <label for="save-difficulty">
              Save Difficulty
            </label>

            <input
              id="save-difficulty"
              name="difficulty"
              type="number"
              min="1"
              step="1"
              value="${startingDifficulty}"
            >

            <p class="hint">
              Number of successes required to pass the Save.
            </p>

          </div>
        `
      : "";

  /* -------------------------------------------- */
  /*  Dialog                                      */
  /* -------------------------------------------- */

  const formData =
    await foundry.applications.api.DialogV2.input({
      window: {
        title
      },

      content: `
        <div class="tactical-roll-dialog">

          <div class="tactical-roll-summary">

            <p>
              <strong>Base Pool:</strong>
              ${startingPool}d12
            </p>

            <p>
              <strong>Base TN:</strong>
              ${startingTN}
            </p>

            ${
              allowDifficulty
                ? `
                    <p>
                      <strong>Save Difficulty:</strong>
                      ${startingDifficulty}
                    </p>
                  `
                : ""
            }

          </div>

          <hr>

          ${specializationContent}

          ${difficultyContent}

          <div class="form-group">

            <label for="rank-die">
              Spend Rank Die
            </label>

            <input
              id="rank-die"
              name="rankDie"
              type="checkbox"
              ${rankDiceAvailable <= 0 ? "disabled" : ""}
            >

            <p class="hint">
              Adds +1d12.
              Rank Dice available: ${rankDiceAvailable}
            </p>

          </div>

          <div class="form-group">

            <label for="dice-modifier">
              Temporary Dice Modifier
            </label>

            <input
              id="dice-modifier"
              name="diceModifier"
              type="number"
              step="1"
              value="0"
            >

            <p class="hint">
              Use for temporary +d12 or -d12 effects that are not yet automated.
            </p>

          </div>

        </div>
      `,

      ok: {
        label: "Submit Roll"
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
  /*  Read Inputs                                 */
  /* -------------------------------------------- */

  const specialization =
    allowSpecialization &&
    Boolean(formData.specialization);

  const rankDie =
    rankDiceAvailable > 0 &&
    Boolean(formData.rankDie);

  const diceModifier =
    Number(
      formData.diceModifier
    ) || 0;

  const difficulty =
    allowDifficulty
      ? Math.max(
          1,
          Math.floor(
            Number(
              formData.difficulty
            ) || startingDifficulty
          )
        )
      : startingDifficulty;

  /* -------------------------------------------- */
  /*  Preview Pool                                */
  /* -------------------------------------------- */

  const previewPool = Math.max(
    0,
    startingPool +
    (specialization ? 1 : 0) +
    (rankDie ? 1 : 0) +
    diceModifier
  );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    specialization,
    rankDie,
    diceModifier,
    difficulty,

    baseTN:
      startingTN,

    basePool:
      startingPool,

    previewPool
  };
}
