/**
 * Tactical
 * Core Foundry VTT system bootstrap.
 *
 * Genre-specific content should be provided by modules such as Invasion.
 */

import { TacticalSkillRegistry } from "./module/registry/skill-registry.mjs";
import { registerCoreSkills } from "./module/registry/core-skills.mjs";

import { TacticalStatusRegistry } from "./module/registry/status-registry.mjs";
import { registerCoreStatuses } from "./module/registry/core-statuses.mjs";

import {
  registerFoundryStatusEffects
} from "./module/status/foundry-status-effects.mjs";

import { TacticalEquipmentTraitRegistry } from "./module/registry/equipment-trait-registry.mjs";
import { registerCoreEquipmentTraits } from "./module/registry/core-equipment-traits.mjs";

import { registerTacticalDataModels } from "./module/data-models/register-data-models.mjs";

import { registerTacticalActorSheets } from "./module/sheets/actor/register-actor-sheets.mjs";

import { runSessionXPAward } from "./module/progression/session-xp-coordinator.mjs";

import {
  registerTacticalRollSocket
} from "./module/socket/roll-request-socket.mjs";

import {
  registerTacticalDamageSocket
} from "./module/socket/damage-request-socket.mjs";

import {
  registerBleedingOutCombatHook
} from "./module/combat/bleeding-out-combat-hook.mjs";

import {
  registerTacticalInitiative
} from "./module/combat/initiative-handler.mjs";

Hooks.once("init", () => {
  console.log("Tactical | Initializing Tactical system");

  /* -------------------------------------------- */
  /*  Data Models                                 */
  /* -------------------------------------------- */

  registerTacticalDataModels();

  /* -------------------------------------------- */
  /*  Actor Sheets                                */
  /* -------------------------------------------- */

  registerTacticalActorSheets();

  /* -------------------------------------------- */
  /*  Initiative                                  */
  /* -------------------------------------------- */

  registerTacticalInitiative();

  /* -------------------------------------------- */
  /*  Skill Registry                              */
  /* -------------------------------------------- */

  const skillRegistry =
    new TacticalSkillRegistry();

  registerCoreSkills(
    skillRegistry
  );

  /* -------------------------------------------- */
  /*  Status Registry                             */
  /* -------------------------------------------- */

  const statusRegistry =
    new TacticalStatusRegistry();

  registerCoreStatuses(
    statusRegistry
  );

  /*
   * Bridge Tactical's status definitions into
   * Foundry's native status-effect system.
   */
  registerFoundryStatusEffects(
    statusRegistry
  );

  /* -------------------------------------------- */
  /*  Equipment Trait Registry                    */
  /* -------------------------------------------- */

  const equipmentTraitRegistry =
    new TacticalEquipmentTraitRegistry();

  registerCoreEquipmentTraits(
    equipmentTraitRegistry
  );

  /* -------------------------------------------- */
  /*  Public Tactical API                         */
  /* -------------------------------------------- */

  game.tactical = {
    version: "0.1.0",

    registries: {
      skills:
        skillRegistry,

      statuses:
        statusRegistry,

      equipmentTraits:
        equipmentTraitRegistry,

      /*
       * Genre modules will be able to register
       * additional Tactical extensions here.
       */
      extensions:
        new Map()
    },

    /* -------------------------------------------- */
    /*  GM Tools                                    */
    /* -------------------------------------------- */

    awardSessionXP:
      runSessionXPAward
  };

  /* -------------------------------------------- */
  /*  Initialization Logging                      */
  /* -------------------------------------------- */

  console.log(
    `Tactical | ${game.tactical.registries.skills.getAll().length} Skills available`
  );

  console.log(
    `Tactical | ${game.tactical.registries.statuses.getAll().length} Status Effects available`
  );

  console.log(
    `Tactical | ${game.tactical.registries.equipmentTraits.getAll().length} Equipment Traits available`
  );

  console.log(
    "Tactical | Initialization complete"
  );
});

Hooks.once("ready", () => {

  /* -------------------------------------------- */
  /*  Socket Registration                         */
  /* -------------------------------------------- */

  registerTacticalRollSocket();
  registerTacticalDamageSocket();

  /* -------------------------------------------- */
  /*  Combat Hooks                                */
  /* -------------------------------------------- */

  registerBleedingOutCombatHook();

  console.log(
    "Tactical | Ready"
  );
});
