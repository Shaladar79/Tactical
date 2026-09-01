/**
 * Tactical
 * Actor Sheet Registration
 *
 * Registers Tactical Actor sheets with Foundry VTT.
 */

import {
  TacticalCharacterSheet
} from "./character-sheet.mjs";

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

  console.log(
    "Tactical | Registered Character Actor Sheet"
  );
}
