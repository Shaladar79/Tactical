/**
 * Tactical
 * Data Model Registration
 *
 * Registers Tactical Actor and Item Data Models with Foundry.
 */

/* -------------------------------------------- */
/*  Actor Data Models                           */
/* -------------------------------------------- */

import { TacticalCharacterData } from "./character-data.mjs";
import { TacticalEnemyData } from "./enemy-data.mjs";
import { TacticalVehicleData } from "./vehicle-data.mjs";

/* -------------------------------------------- */
/*  Item Data Models                            */
/* -------------------------------------------- */

import { TacticalWeaponData } from "./weapon-data.mjs";
import { TacticalArmorData } from "./armor-data.mjs";
import { TacticalUtilityData } from "./utility-data.mjs";
import { TacticalConsumableData } from "./consumable-data.mjs";
import { TacticalAncestryData } from "./ancestry-data.mjs";
import { TacticalArchetypeData } from "./archetype-data.mjs";
import { TacticalSpecializationData } from "./specialization-data.mjs";
import { TacticalTalentData } from "./talent-data.mjs";
import { TacticalAbilityData } from "./ability-data.mjs";

/**
 * Register all Tactical Data Models.
 */
export function registerTacticalDataModels() {
  console.log("Tactical | Registering Data Models");

  /* -------------------------------------------- */
  /*  Actor Data Models                           */
  /* -------------------------------------------- */

  CONFIG.Actor.dataModels = {
    ...CONFIG.Actor.dataModels,

    character: TacticalCharacterData,
    enemy: TacticalEnemyData,
    vehicle: TacticalVehicleData
  };

  /* -------------------------------------------- */
  /*  Item Data Models                            */
  /* -------------------------------------------- */

  CONFIG.Item.dataModels = {
    ...CONFIG.Item.dataModels,

    weapon: TacticalWeaponData,
    armor: TacticalArmorData,
    utility: TacticalUtilityData,
    consumable: TacticalConsumableData,
    ancestry: TacticalAncestryData,
    archetype: TacticalArchetypeData,
    specialization: TacticalSpecializationData,
    talent: TacticalTalentData,
    ability: TacticalAbilityData
  };

  console.log(
    "Tactical | Registered 3 Actor Data Models and 9 Item Data Models"
  );
}
