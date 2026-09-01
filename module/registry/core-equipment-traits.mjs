/**
 * Tactical
 * Core Equipment Traits
 *
 * Registers the default equipment traits used by the Tactical core system.
 */

export function registerCoreEquipmentTraits(traitRegistry) {

  traitRegistry.register("heavy", {
    name: "Heavy",
    description:
      "While equipped, the item reduces Movement by 1.",
    source: "tactical"
  });

  traitRegistry.register("lightweight", {
    name: "Lightweight",
    description:
      "While equipped, the item increases Movement by 1.",
    source: "tactical"
  });

  traitRegistry.register("stationary-fire", {
    name: "Stationary Fire",
    description:
      "The weapon cannot be fired during a turn in which the character has moved.",
    source: "tactical"
  });

  traitRegistry.register("scatter-shot", {
    name: "Scatter Shot",
    description:
      "The weapon fires a spread of projectiles. The effect is normally represented by the weapon's existing statistics unless another rule modifies it.",
    source: "tactical"
  });

  traitRegistry.register("sidearm", {
    name: "Sidearm",
    description:
      "The weapon is compact enough to occupy a Secondary Weapon slot.",
    source: "tactical"
  });

  traitRegistry.register("burst-fire", {
    name: "Burst Fire",
    description:
      "Each attack represents a short burst of multiple projectiles. The additional projectiles are already represented by the weapon's DPS and Magazine Capacity.",
    source: "tactical"
  });

  console.log(
    `Tactical | Registered ${traitRegistry.getAll().length} core Equipment Traits`
  );
}
