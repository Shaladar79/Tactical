/**
 * Tactical
 * Actor Sheet Registration
 *
 * Registers Tactical Actor sheets with Foundry VTT.
 */

import {
  TacticalCharacterSheet
} from "./character-sheet.mjs";

import {
  TacticalEnemySheet
} from "./enemy-sheet.mjs";

import {
  TacticalVehicleSheet
} from "./vehicle-sheet.mjs";

/**
 * Register Tactical Actor sheets.
 */
export function registerTacticalActorSheets() {

  DocumentSheetConfig.registerSheet(
    Actor,
    "tactical",
    TacticalCharacterSheet,
    {
      types: [
        "character"
      ],

      makeDefault: true,

      label: "Tactical Character Sheet"
    }
  );

  DocumentSheetConfig.registerSheet(
    Actor,
    "tactical",
    TacticalEnemySheet,
    {
      types: [
        "enemy"
      ],

      makeDefault: true,

      label: "Tactical Enemy Sheet"
    }
  );

  DocumentSheetConfig.registerSheet(
    Actor,
    "tactical",
    TacticalVehicleSheet,
    {
      types: [
        "vehicle"
      ],

      makeDefault: true,

      label: "Tactical Vehicle Sheet"
    }
  );

  console.log(
    "Tactical | Registered Character, Enemy, and Vehicle Actor Sheets"
  );
}
