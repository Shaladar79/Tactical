/**
 * Tactical
 * Data Model Registration
 *
 * Registers Tactical Actor and Item Data Models with Foundry.
 */

import { TacticalCharacterData } from "./character-data.mjs";
import { TacticalTrooperData } from "./trooper-data.mjs";
import { TacticalLieutenantData } from "./lieutenant-data.mjs";
import { TacticalCommanderData } from "./commander-data.mjs";
import { TacticalOverlordData } from "./overlord-data.mjs";

/**
 * Register all currently available Tactical Data Models.
 *
 * Additional Actor and Item models will be added here as
 * their individual files are created.
 */
export function registerTacticalDataModels() {
  console.log("Tactical | Registering Data Models");

  /* -------------------------------------------- */
  /*  Actor Data Models                           */
  /* -------------------------------------------- */

  CONFIG.Actor.dataModels = {
    ...CONFIG.Actor.dataModels,

    character: TacticalCharacterData,
    trooper: TacticalTrooperData,
    lieutenant: TacticalLieutenantData,
    commander: TacticalCommanderData,
    overlord: TacticalOverlordData
  };

  /* -------------------------------------------- */
  /*  Item Data Models                            */
  /* -------------------------------------------- */

  /*
   * Item Data Models will be registered here
   * as their individual files are created.
   */

  console.log("Tactical | Data Models registered");
}
