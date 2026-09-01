/**
 * Tactical
 * Core Skills
 *
 * Registers the default Skill list used by the base Tactical system.
 */

export function registerCoreSkills(skillRegistry) {

  skillRegistry.register("athletics", {
    name: "Athletics",
    attribute: "might",
    description:
      "Physical exertion, climbing, jumping, throwing, swimming, and similar feats.",
    source: "tactical"
  });

  skillRegistry.register("melee", {
    name: "Melee",
    attribute: "might",
    description:
      "Close-combat attacks, weapon handling, grappling, and other melee actions.",
    source: "tactical"
  });

  skillRegistry.register("ranged", {
    name: "Ranged",
    attribute: "aim",
    description:
      "Use of firearms, bows, launchers, and other ranged weapons.",
    source: "tactical"
  });

  skillRegistry.register("stealth", {
    name: "Stealth",
    attribute: "agility",
    description:
      "Moving quietly, hiding, maintaining concealment, and avoiding detection.",
    source: "tactical"
  });

  skillRegistry.register("awareness", {
    name: "Awareness",
    attribute: "perception",
    description:
      "Detecting threats, noticing hidden details, spotting concealed targets, and maintaining situational awareness.",
    source: "tactical"
  });

  skillRegistry.register("survival", {
    name: "Survival",
    attribute: "perception",
    description:
      "Tracking, navigation, wilderness survival, fieldcraft, and environmental knowledge.",
    source: "tactical"
  });

  skillRegistry.register("medicine", {
    name: "Medicine",
    attribute: "focus",
    description:
      "Stabilizing injuries, treating wounds, using medical equipment, and diagnosing physical trauma.",
    source: "tactical"
  });

  skillRegistry.register("influence", {
    name: "Influence",
    attribute: "resolve",
    description:
      "Persuasion, leadership, intimidation, negotiation, and other forms of social pressure.",
    source: "tactical"
  });

  skillRegistry.register("deception", {
    name: "Deception",
    attribute: "focus",
    description:
      "Lying, misdirection, disguises, concealment of intent, and manipulation through false information.",
    source: "tactical"
  });

  skillRegistry.register("knowledge", {
    name: "Knowledge",
    attribute: "focus",
    description:
      "Education, research, academic expertise, investigation, and recalling specialized information.",
    source: "tactical"
  });

  skillRegistry.register("crafting", {
    name: "Crafting",
    attribute: "agility",
    description:
      "Building, repairing, modifying, fabricating, and performing precision technical work.",
    source: "tactical"
  });

  skillRegistry.register("vehicles", {
    name: "Vehicles",
    attribute: "agility",
    description:
      "Operating cars, trucks, aircraft, boats, armored vehicles, and other controlled vehicles.",
    source: "tactical"
  });

  skillRegistry.register("technology", {
    name: "Technology",
    attribute: "focus",
    description:
      "Computers, electronics, hacking, diagnostics, digital systems, communications, and modern technical equipment.",
    source: "tactical"
  });

  console.log(
    `Tactical | Registered ${skillRegistry.getAll().length} core Skills`
  );
}
