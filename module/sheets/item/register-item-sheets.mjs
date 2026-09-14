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

import {
  TacticalArmorSheet
} from "./armor-sheet.mjs";

import {
  TacticalUtilitySheet
} from "./utility-sheet.mjs";

import {
  TacticalAncestrySheet
} from "./ancestry-sheet.mjs";

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

  DocumentSheetConfig.registerSheet(
    Item,
    "tactical",
    TacticalArmorSheet,
    {
      types: [
        "armor"
      ],

      makeDefault: true,

      label: "Tactical Armor Sheet"
    }
  );

  DocumentSheetConfig.registerSheet(
    Item,
    "tactical",
    TacticalUtilitySheet,
    {
      types: [
        "utility"
      ],

      makeDefault: true,

      label: "Tactical Utility Sheet"
    }
  );

  DocumentSheetConfig.registerSheet(
    Item,
    "tactical",
    TacticalAncestrySheet,
    {
      types: [
        "ancestry"
      ],

      makeDefault: true,

      label: "Tactical Ancestry Sheet"
    }
  );

  console.log(
    "Tactical | Registered Consumable, Weapon, Armor, Utility, and Ancestry Item Sheets"
  );
}
