/**
 * Tactical
 * Bleeding Out Combat Hook
 *
 * Automatically resolves Bleeding Out when a
 * combatant's turn begins.
 */

import {
  rollActorBleedingOut
} from "./bleeding-out-check.mjs";

/**
 * Register Tactical Bleeding Out combat handling.
 */
export function registerBleedingOutCombatHook() {

  Hooks.on(
    "updateCombat",
    async (
      combat,
      changed,
      options,
      userId
    ) => {

      /*
       * Only the GM should perform automatic
       * combat-state resolution.
       */
      if (!game.user.isGM) {
        return;
      }

      /*
       * We only care when the active turn changes.
       */
      if (
        changed.turn === undefined &&
        changed.round === undefined
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

      const statuses =
        actor.statuses;

      if (!statuses) {
        return;
      }

      /* -------------------------------------------- */
      /*  Bleeding Out Check                         */
      /* -------------------------------------------- */

      if (
        statuses.has("bleeding-out") &&
        !statuses.has("stable") &&
        !statuses.has("dead")
      ) {

        await rollActorBleedingOut(
          actor
        );
      }
    }
  );

  console.log(
    "Tactical | Bleeding Out combat hook registered"
  );
}
