/**
 * Tactical
 * Initiative Handler
 *
 * Tactical initiative rules:
 *
 * Character:
 * 1d12 + Perception + Agility
 *
 * Trooper / Lieutenant / Commander / Overlord / Vehicle:
 * 1d12 + Initiative
 */

/**
 * Build the Tactical initiative formula for an Actor.
 *
 * @param {Actor} actor
 * @returns {string}
 */
export function getTacticalInitiativeFormula(
  actor
) {

  if (!actor) {
    return "1d12";
  }

  /* -------------------------------------------- */
  /*  Character Initiative                        */
  /* -------------------------------------------- */

  if (actor.type === "character") {

    const perception =
      Math.max(
        0,
        Number(
          actor.system.attributes?.perception
        ) || 0
      );

    const agility =
      Math.max(
        0,
        Number(
          actor.system.attributes?.agility
        ) || 0
      );

    return (
      `1d12 + ${perception} + ${agility}`
    );
  }

  /* -------------------------------------------- */
  /*  Enemy / Vehicle Initiative                  */
  /* -------------------------------------------- */

  const initiative =
    Math.max(
      0,
      Number(
        actor.system.initiative
      ) || 0
    );

  return (
    `1d12 + ${initiative}`
  );
}

/**
 * Register Tactical's custom Combatant
 * initiative-roll behavior.
 */
export function registerTacticalInitiative() {

  /*
   * Preserve Foundry's original method so we can
   * fall back safely when a Combatant has no Actor.
   */
  const originalGetInitiativeRoll =
    Combatant.prototype.getInitiativeRoll;

  Combatant.prototype.getInitiativeRoll =
    function(options = {}) {

      const actor =
        this.actor;

      if (!actor) {

        return originalGetInitiativeRoll.call(
          this,
          options
        );
      }

      const formula =
        getTacticalInitiativeFormula(
          actor
        );

      return new Roll(
        formula,
        actor.getRollData?.() ?? {}
      );
    };

  console.log(
    "Tactical | Custom initiative registered"
  );
}
