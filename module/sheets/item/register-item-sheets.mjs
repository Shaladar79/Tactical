/**
 * Tactical
 * Item Sheet Registration
 *
 * Registers Tactical Item sheets with Foundry VTT.
 */

import {
  TacticalConsumableSheet
} from "./consumable-sheet.mjs";

import {
  TacticalWeaponSheet
} from "./weapon-sheet.mjs";

/**
 * Register Tactical Item sheets.
 */
export function registerTacticalItemSheets() {

  DocumentSheetConfig.registerSheet(
    Item,
    "tactical",
    TacticalConsumableSheet,
    {
      types: [
        "consumable"
      ],

      makeDefault: true,

      label: "Tactical Consumable Sheet"
    }
  );

  DocumentSheetConfig.registerSheet(
    Item,
    "tactical",
    TacticalWeaponSheet,
    {
      types: [
        "weapon"
      ],

      makeDefault: true,

      label: "Tactical Weapon Sheet"
    }
  );

  console.log(
    "Tactical | Registered Consumable and Weapon Item Sheets"
  );
}
