/**
 * Tactical
 * Weapon Attack Helper
 *
 * Resolves a weapon attack up to the point where
 * damage is ready to be applied to a target.
 *
 * Flow:
 *
 * 1. Validate attacker and Weapon Item.
 * 2. Read Attribute + Skill values.
 * 3. Open player pre-roll configuration.
 * 4. Build final dice pool.
 * 5. Send attack request to GM.
 * 6. GM selects range / cover / position modifiers.
 * 7. Roll attack.
 * 8. Calculate raw damage from Successes × DPS.
 */

import {
  buildTacticalPool
} from "../dice/build-pool.mjs";

import {
  rollTacticalPool
} from "../dice/tactical-roll.mjs";

import {
  promptTacticalRoll
} from "../dice/roll-dialog.mjs";

import {
  requestGMTNApproval
} from "../socket/roll-request-socket.mjs";

/**
 * Resolve a Tactical weapon attack.
 *
 * @param {Actor} actor
 * Actor making the attack.
 *
 * @param {Item} weapon
 * Weapon Item being used.
 *
 * @param {object} options
 *
 * @param {string} options.attributeId
 * Attribute used for the attack.
 *
 * @param {string} options.skillId
 * Skill used for the attack.
 *
 * @param {string} options.flavor
 * Optional roll display name.
 *
 * @returns {Promise<object|null>}
 */
export async function rollWeaponAttack(
  actor,
  weapon,
  {
    attributeId = "",
    skillId = "",
    flavor = ""
  } = {}
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Weapon attacks require an Actor."
    );
  }

  if (!weapon || weapon.type !== "weapon") {
    throw new Error(
      "Tactical | Weapon attacks require a Weapon Item."
    );
  }

  if (!attributeId) {
    throw new Error(
      "Tactical | Weapon attacks require an Attribute."
    );
  }

  if (!skillId) {
    throw new Error(
      "Tactical | Weapon attacks require a Skill."
    );
  }

  const system =
    weapon.system;

  /* -------------------------------------------- */
  /*  Attribute                                   */
  /* -------------------------------------------- */

  const attribute =
    Math.max(
      0,
      Number(
        actor.system.attributes?.[
          attributeId
        ]
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Skill                                       */
  /* -------------------------------------------- */

  const skill =
    Math.max(
      0,
      Number(
        actor.system.skills?.[
          skillId
        ]
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Base Dice Pool                              */
  /* -------------------------------------------- */

  const basePool =
    attribute + skill;

  /* -------------------------------------------- */
  /*  Rank Dice                                   */
  /* -------------------------------------------- */

  const availableRankDice =
    Math.max(
      0,
      Number(
        actor.system.rankDice?.value
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Roll Name                                   */
  /* -------------------------------------------- */

  const rollName =
    flavor ||
    `${actor.name}: ${weapon.name}`;

  /* -------------------------------------------- */
  /*  Player Roll Options                         */
  /* -------------------------------------------- */

  const playerOptions =
    await promptTacticalRoll({
      title:
        rollName,

      basePool,

      baseTN:
        7,

      availableRankDice
    });

  if (!playerOptions) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Validate Rank Die                           */
  /* -------------------------------------------- */

  if (
    playerOptions.rankDie &&
    availableRankDice <= 0
  ) {

    ui.notifications.warn(
      `${actor.name} has no Rank Dice remaining.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Build Final Dice Pool                       */
  /* -------------------------------------------- */

  const poolData =
    buildTacticalPool({
      attribute,
      skill,

      specialization:
        playerOptions.specialization,

      rankDie:
        playerOptions.rankDie,

      modifier:
        playerOptions.diceModifier
    });

  /* -------------------------------------------- */
  /*  Weapon Range Overrides                      */
  /* -------------------------------------------- */

  /**
   * Weapon Items currently store an intendedRange,
   * but specialized profiles such as Sniper Rifles
   * can later store explicit overrides.
   *
   * If rangeOverrides does not yet exist on an older
   * Weapon Item, this simply passes an empty object.
   */
  const rangeOverrides =
    system.rangeOverrides ?? {};

  /* -------------------------------------------- */
  /*  GM Attack Approval                          */
  /* -------------------------------------------- */

  const approval =
    await requestGMTNApproval({
      requestType:
        "attack",

      actorName:
        actor.name,

      rollName,

      baseTN:
        7,

      dicePool:
        poolData.total,

      rangeOverrides
    });

  if (!approval) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Spend Rank Die                              */
  /* -------------------------------------------- */

  if (playerOptions.rankDie) {

    await actor.update({
      "system.rankDice.value":
        Math.max(
          0,
          availableRankDice - 1
        )
    });
  }

  /* -------------------------------------------- */
  /*  Ammunition                                  */
  /* -------------------------------------------- */

  const usesMagazine =
    system.usesMagazine !== false;

  if (usesMagazine) {

    const ammoRemaining =
      Math.max(
        0,
        Number(
          system.ammoRemaining
        ) || 0
      );

    if (ammoRemaining <= 0) {

      ui.notifications.warn(
        `${weapon.name} is out of ammunition.`
      );

      /*
       * Refund the Rank Die because no attack
       * was actually made.
       */
      if (playerOptions.rankDie) {

        await actor.update({
          "system.rankDice.value":
            availableRankDice
        });
      }

      return null;
    }

    await weapon.update({
      "system.ammoRemaining":
        ammoRemaining - 1
    });
  }

  /* -------------------------------------------- */
  /*  Roll Attack                                 */
  /* -------------------------------------------- */

  const result =
    await rollTacticalPool({
      pool:
        poolData.total,

      tn:
        approval.finalTN,

      flavor:
        rollName
    });

  /* -------------------------------------------- */
  /*  Weapon Damage Data                          */
  /* -------------------------------------------- */

  const dps =
    Math.max(
      0,
      Number(system.dps) || 0
    );

  const penetration =
    Math.max(
      0,
      Number(system.penetration) || 0
    );

  const rawDamage =
    result.successes * dps;

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    actorId:
      actor.id,

    weaponId:
      weapon.id,

    weaponName:
      weapon.name,

    attributeId,
    skillId,

    roll:
      result,

    poolData,

    playerOptions: {
      specialization:
        playerOptions.specialization,

      rankDie:
        playerOptions.rankDie,

      diceModifier:
        playerOptions.diceModifier
    },

    targetNumber: {
      base:
        approval.baseTN,

      modifier:
        approval.tnModifier,

      final:
        approval.finalTN,

      range:
        approval.range,

      modifiers:
        approval.modifiers ?? {},

      breakdown:
        approval.breakdown ?? {}
    },

    weapon: {
      dps,
      penetration,

      magazineCapacity:
        Math.max(
          0,
          Number(
            system.magazineCapacity
          ) || 0
        ),

      ammoRemaining:
        usesMagazine
          ? Math.max(
              0,
              (Number(system.ammoRemaining) || 0) - 1
            )
          : null,

      usesMagazine,

      intendedRange:
        system.intendedRange ?? "short"
    },

    damage: {
      successes:
        result.successes,

      dps,

      rawDamage,

      penetration
    }
  };
}
