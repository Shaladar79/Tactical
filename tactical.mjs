/**
 * Tactical
 * Core Foundry VTT system bootstrap.
 *
 * Genre-specific content should be provided by modules such as Invasion.
 */

import { TacticalSkillRegistry } from "./module/registry/skill-registry.mjs";
import { registerCoreSkills } from "./module/registry/core-skills.mjs";

Hooks.once("init", () => {
  console.log("Tactical | Initializing Tactical system");

  /**
   * Create the core Skill registry.
   */
  const skillRegistry = new TacticalSkillRegistry();

  /**
   * Register Tactical's default modern-day Skills.
   */
  registerCoreSkills(skillRegistry);

  /**
   * Public Tactical API.
   *
   * Future genre modules can access shared Tactical functionality through:
   *
   * game.tactical
   */
  game.tactical = {
    version: "0.1.0",

    registries: {
      skills: skillRegistry,

      /*
       * These will receive dedicated registry classes later.
       */
      statuses: new Map(),
      equipmentTraits: new Map(),
      extensions: new Map()
    }
  };

  console.log(
    `Tactical | ${game.tactical.registries.skills.getAll().length} Skills available`
  );
});

Hooks.once("ready", () => {
  console.log("Tactical | Ready");
});
