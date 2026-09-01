/**
 * Tactical
 * Core Foundry VTT system bootstrap.
 *
 * Genre-specific content should be provided by modules such as Invasion.
 */

import { TacticalSkillRegistry } from "./module/registry/skill-registry.mjs";
import { registerCoreSkills } from "./module/registry/core-skills.mjs";
import { registerTacticalDataModels } from "./module/data-models/register-data-models.mjs";

Hooks.once("init", () => {
  console.log("Tactical | Initializing Tactical system");

  /* -------------------------------------------- */
  /*  Data Models                                 */
  /* -------------------------------------------- */

  registerTacticalDataModels();

  /* -------------------------------------------- */
  /*  Skill Registry                              */
  /* -------------------------------------------- */

  const skillRegistry = new TacticalSkillRegistry();

  registerCoreSkills(skillRegistry);

  /* -------------------------------------------- */
  /*  Public Tactical API                         */
  /* -------------------------------------------- */

  game.tactical = {
    version: "0.1.0",

    registries: {
      skills: skillRegistry,

      /*
       * These will receive dedicated registry
       * classes as we build those systems.
       */
      statuses: new Map(),
      equipmentTraits: new Map(),
      extensions: new Map()
    }
  };

  console.log(
    `Tactical | ${game.tactical.registries.skills.getAll().length} Skills available`
  );

  console.log("Tactical | Initialization complete");
});

Hooks.once("ready", () => {
  console.log("Tactical | Ready");
});
