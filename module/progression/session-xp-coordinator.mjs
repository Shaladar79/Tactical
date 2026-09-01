/**
 * Tactical
 * Session XP Coordinator
 *
 * Coordinates the complete Session XP workflow:
 *
 * 1. Gather selected character Actors.
 * 2. Calculate average party Rank.
 * 3. Calculate Base Session XP.
 * 4. Ask the GM for optional Bonus XP.
 * 5. Confirm the final award.
 * 6. Award XP to each selected character.
 */

import {
  promptSessionXPAward
} from "./session-xp-award.mjs";

import {
  applySessionXP
} from "./apply-session-xp.mjs";

/**
 * Award Session XP to the currently selected
 * Tactical character tokens.
 *
 * @returns {Promise<object|null>}
 */
export async function runSessionXPAward() {

  /* -------------------------------------------- */
  /*  GM Only                                     */
  /* -------------------------------------------- */

  if (!game.user.isGM) {
    ui.notifications.warn(
      "Only a GM can award Session XP."
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Gather Selected Characters                  */
  /* -------------------------------------------- */

  const controlledTokens =
    canvas?.tokens?.controlled ?? [];

  const actors = [
    ...new Map(
      controlledTokens
        .map(token => token.actor)
        .filter(
          actor =>
            actor &&
            actor.type === "character"
        )
        .map(
          actor => [actor.uuid, actor]
        )
    ).values()
  ];

  if (actors.length === 0) {
    ui.notifications.warn(
      "Select at least one Tactical character token before awarding Session XP."
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Party Ranks                                 */
  /* -------------------------------------------- */

  const ranks = actors.map(
    actor =>
      Math.max(
        0,
        Number(actor.system.rank) || 0
      )
  );

  /* -------------------------------------------- */
  /*  Calculate Base + Bonus XP                   */
  /* -------------------------------------------- */

  const xpResult =
    await promptSessionXPAward(ranks);

  /*
   * GM cancelled the Bonus XP dialog.
   */
  if (!xpResult) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Final Confirmation                          */
  /* -------------------------------------------- */

  const characterNames = actors
    .map(actor => actor.name)
    .join(", ");

  const confirmed =
    await foundry.applications.api.DialogV2.confirm({
      window: {
        title: "Confirm Session XP"
      },

      content: `
        <div class="tactical-session-xp-confirm">

          <p>
            <strong>Characters:</strong>
            ${characterNames}
          </p>

          <p>
            <strong>Average Party Rank:</strong>
            ${xpResult.averageRank.toFixed(2)}
          </p>

          <p>
            <strong>Base XP:</strong>
            ${xpResult.baseXP}
          </p>

          <p>
            <strong>Bonus XP:</strong>
            ${xpResult.bonusXP}
          </p>

          <hr>

          <p>
            <strong>XP Award Per Character:</strong>
            ${xpResult.totalXP}
          </p>

          <p>
            Award ${xpResult.totalXP} XP to
            ${actors.length}
            character${actors.length === 1 ? "" : "s"}?
          </p>

        </div>
      `,

      yes: {
        label: "Award XP"
      },

      no: {
        label: "Cancel"
      },

      modal: true
    });

  if (!confirmed) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Apply XP                                    */
  /* -------------------------------------------- */

  const awardResult =
    await applySessionXP(
      actors,
      xpResult.totalXP
    );

  /* -------------------------------------------- */
  /*  Notification                                */
  /* -------------------------------------------- */

  if (awardResult.success) {
    ui.notifications.info(
      `Awarded ${xpResult.totalXP} XP to ${awardResult.updated.length} character${awardResult.updated.length === 1 ? "" : "s"}.`
    );
  }

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    xp: xpResult,
    award: awardResult
  };
}
