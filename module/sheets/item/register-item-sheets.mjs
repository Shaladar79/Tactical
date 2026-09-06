/**
 * Tactical
 * Item Sheet Registration
 *
 * Registers Tactical Item sheets with Foundry VTT.
 */

import {
  TacticalConsumableSheet
} from "./consumable-sheet.mjs";

/**
 * Register Tactical Item sheets.
 */
export function registerTacticalItemSheets() {

  const {
    Item
  } = foundry.documents;

  const {
    ItemSheetV2
  } = foundry.applications.sheets;

  /*
   * Remove Foundry's generic Item sheet for the
   * Tactical system where appropriate.
   *
   * Tactical Item types should use their own
   * dedicated sheets.
   */
  Items.unregisterSheet(
    "core",
    ItemSheetV2
  );

  /* -------------------------------------------- */
  /*  Consumable                                  */
  /* -------------------------------------------- */

  Items.registerSheet(
    "tactical",
    TacticalConsumableSheet,
    {
      types: [
        "consumable"
      ],

      makeDefault:
        true,

      label:
        "Tactical Consumable"
    }
  );
}
