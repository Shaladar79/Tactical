/**
 * Tactical
 * Action Economy Combat Hook
 *
 * Resets a combatant's Tactical Actions when
 * their turn begins.
 */

import {
  resetActions
} from "./action-economy.mjs";

/**
 * Register Tactical Action reset handling.
 */
export function registerActionEconomyCombatHook() {

  Hooks.on(
    "updateCombat",
    async (
      combat,
      changed,
      options,
      userId
    ) => {

      /*
       * Only the GM should authoritatively reset
       * turn resources.
       */
      if (!game.user.isGM) {
        return;
      }

      /*
       * Only react to actual turn or round changes.
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

      /*
       * Default Tactical combatants receive
       * 2 Actions at the start of their turn.
       *
       * Vehicles already expose an Actions field,
       * so they may override the standard value.
       */
      const maxActions =
        actor.type === "vehicle"
          ? Math.max(
              0,
              Number(
                actor.system.actions
              ) || 2
            )
          : 2;

      await resetActions(
        actor,
        maxActions
      );

      console.log(
        `Tactical | Reset ${actor.name} to ${maxActions} Actions`
      );
    }
  );

  console.log(
    "Tactical | Action Economy combat hook registered"
  );
}
