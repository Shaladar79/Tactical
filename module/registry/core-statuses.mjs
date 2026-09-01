/**
 * Tactical
 * Core Status Effects
 *
 * Registers the default Status Effects used by the Tactical core system.
 */

export function registerCoreStatuses(statusRegistry) {

  statusRegistry.register("bleeding", {
    name: "Bleeding",
    description:
      "Deals Health damage each round. Damage and duration are determined by the source. Combat Stims and Medkits remove Bleeding.",
    source: "tactical"
  });

  statusRegistry.register("bleeding-out", {
    name: "Bleeding Out",
    description:
      "A character at 0 Health is Unconscious and Bleeding Out until stabilized. Failed Bleeding Out rolls add Wounds.",
    source: "tactical"
  });

  statusRegistry.register("burning", {
    name: "Burning",
    description:
      "Deals Health damage at the end of the affected character's turn. Damage and duration are determined by the source. Spending 1 Action may extinguish the effect.",
    source: "tactical"
  });

  statusRegistry.register("poisoned", {
    name: "Poisoned",
    description:
      "Applies a source-defined d12 penalty to Actions for a set duration. Poisoned does not inherently deal damage. Medkits remove Poisoned.",
    source: "tactical"
  });

  statusRegistry.register("disoriented", {
    name: "Disoriented",
    description:
      "The character may only take Move Actions, cannot attack or make Reactions, and moves at half normal Movement, rounding up.",
    source: "tactical"
  });

  statusRegistry.register("stunned", {
    name: "Stunned",
    description:
      "The character cannot take Actions or make Reactions for the duration.",
    source: "tactical"
  });

  statusRegistry.register("prone", {
    name: "Prone",
    description:
      "Movement is halved. Standing costs 1 Action. Ranged attacks from more than 1 square away suffer +1 TN, while melee attacks against the target gain -1 TN.",
    source: "tactical"
  });

  statusRegistry.register("immobilized", {
    name: "Immobilized",
    description:
      "Movement becomes 0. The character may still attack, use abilities, take other Actions, and make Reactions.",
    source: "tactical"
  });

  statusRegistry.register("suppressed", {
    name: "Suppressed",
    description:
      "The character suffers -1d12 on attacks. Movement may trigger a Reaction Shot from the source of the Suppression.",
    source: "tactical"
  });

  statusRegistry.register("concealed", {
    name: "Concealed",
    description:
      "The character is hidden from enemies. Movement while maintaining Concealment suffers -3 Movement, minimum 1. Concealment normally ends on attack, successful detection, damage, or a clearly revealing action.",
    source: "tactical"
  });

  statusRegistry.register("stable", {
    name: "Stable",
    description:
      "The character is no longer Bleeding Out but remains Unconscious while at 0 Health.",
    source: "tactical"
  });

  statusRegistry.register("unconscious", {
    name: "Unconscious",
    description:
      "The character cannot take Actions or make Reactions. A character at 0 Health who is not Stable is also Bleeding Out.",
    source: "tactical"
  });

  console.log(
    `Tactical | Registered ${statusRegistry.getAll().length} core Status Effects`
  );
}
