/**
 * Tactical
 * Overwatch Combat Hook
 *
 * Clears an Actor's Overwatch state when
 * that Actor's next turn begins.
 */

import {
  isActorOnOverwatch,
  clearOverwatch
} from "./overwatch-action.mjs";

/**
 * Register automatic Overwatch expiration.
 */
export function registerOverwatchCombatHook() {

  Hooks.on(
    "updateCombat",
    async (
      combat,
      changed
    ) => {

      /* -------------------------------------------- */
      /*  GM Authority                                 */
      /* -------------------------------------------- */

      if (!game.user.isGM) {
        return;
      }

      /* -------------------------------------------- */
      /*  Turn Change                                  */
      /* -------------------------------------------- */

      /*
       * Only respond when the active turn changes.
       *
       * We intentionally do not use changed.round
       * here because Foundry can update both round
       * and turn during the same transition.
       */
      if (
        changed.turn === undefined
      ) {
        return;
      }

      const combatant =
        combat.combatant;

      if (!combatant) {
        return;
      }

      const actor =
        combatant.actor;

      if (!actor) {
        return;
      }

      /* -------------------------------------------- */
      /*  Overwatch Expiration                        */
      /* -------------------------------------------- */

      if (
        !isActorOnOverwatch(actor)
      ) {
        return;
      }

      await clearOverwatch(
        actor
      );

      console.log(
        `Tactical | ${actor.name}'s Overwatch expired at the start of their turn.`
      );
    }
  );

  console.log(
    "Tactical | Overwatch combat hook registered"
  );
}
