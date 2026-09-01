/**
 * Tactical
 * Session XP Award Helper
 *
 * Calculates base session XP, prompts the GM for
 * optional Bonus XP, and returns the final award.
 */

import {
  calculateSessionXP,
  getAveragePartyRank,
  getBaseSessionXP
} from "./session-xp.mjs";

/**
 * Prompt the GM for Bonus XP and calculate
 * the final Session XP award.
 *
 * @param {Array<number>} ranks
 * Party Rank values.
 *
 * @returns {Promise<object|null>}
 * Returns null if the dialog is cancelled.
 */
export async function promptSessionXPAward(ranks = []) {

  const averageRank =
    getAveragePartyRank(ranks);

  const baseXP =
    getBaseSessionXP(averageRank);

  const formData =
    await foundry.applications.api.DialogV2.input({
      window: {
        title: "Tactical Session XP"
      },

      content: `
        <div class="tactical-session-xp">

          <p>
            <strong>Average Party Rank:</strong>
            ${averageRank.toFixed(2)}
          </p>

          <p>
            <strong>Base Session XP:</strong>
            ${baseXP}
          </p>

          <div class="form-group">
            <label for="bonus-xp">
              Bonus XP
            </label>

            <input
              id="bonus-xp"
              name="bonusXP"
              type="number"
              min="0"
              step="1"
              value="0"
              autofocus
            >
          </div>

        </div>
      `,

      ok: {
        label: "Calculate XP"
      },

      rejectClose: false,
      modal: true
    });

  /*
   * Dialog was cancelled.
   */
  if (!formData) {
    return null;
  }

  const bonusXP = Math.max(
    0,
    Number(formData.get("bonusXP")) || 0
  );

  return calculateSessionXP({
    ranks,
    bonusXP
  });
}
