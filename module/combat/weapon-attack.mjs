/**
 * Tactical
 * Weapon Attack Helper
 *
 * Full weapon attack workflow:
 *
 * 1. Validate attacker and Weapon Item.
 * 2. Require exactly one targeted token.
 * 3. Validate turn and Action availability.
 * 4. Check ammunition.
 * 5. Read Attribute + Skill values.
 * 6. Open player pre-roll configuration.
 * 7. Build final dice pool.
 * 8. Send attack request to GM.
 * 9. GM selects range / cover / position modifiers.
 * 10. Commit attack and spend 1 Action.
 * 11. Spend Rank Die if selected.
 * 12. Consume ammunition.
 * 13. Roll attack.
 * 14. Calculate attack damage data.
 * 15. If the attack succeeds, send a damage request
 *     to the GM for approval and automatic application.
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

import {
  requestDamageApplication
} from "../socket/damage-request-socket.mjs";

import {
  canSpendActions,
  spendActions
} from "./action-economy.mjs";

/* -------------------------------------------- */
/*  Combat Helpers                              */
/* -------------------------------------------- */

function getActorCombatant(actor) {

  const combat =
    game.combat;

  if (
    !combat ||
    !actor
  ) {
    return null;
  }

  return combat.combatants.find(
    combatant =>
      combatant.actor?.id ===
      actor.id
  ) ?? null;
}

function isActorsTurn(actor) {

  const activeCombatant =
    game.combat?.combatant;

  if (
    !activeCombatant ||
    !actor
  ) {
    return false;
  }

  return (
    activeCombatant.actor?.id ===
    actor.id
  );
}

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

  if (
    !weapon ||
    weapon.type !== "weapon"
  ) {
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
  /*  Combat / Action Validation                  */
  /* -------------------------------------------- */

  const combatant =
    getActorCombatant(
      actor
    );

  const inCombat =
    Boolean(
      combatant
    );

  /*
   * Normal attacks may only happen during the
   * Actor's own turn.
   *
   * Overwatch and other Reaction attacks will use
   * a separate reaction workflow later.
   */
  if (
    inCombat &&
    !isActorsTurn(actor)
  ) {

    ui.notifications.warn(
      `It is not ${actor.name}'s turn.`
    );

    return null;
  }

  if (
    inCombat &&
    !canSpendActions(
      actor,
      1
    )
  ) {

    ui.notifications.warn(
      `${actor.name} has no Actions remaining.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Target                                      */
  /* -------------------------------------------- */

  const targets =
    Array.from(
      game.user.targets ?? []
    );

  if (
    targets.length === 0
  ) {

    ui.notifications.warn(
      "Target a token before making an attack."
    );

    return null;
  }

  if (
    targets.length > 1
  ) {

    ui.notifications.warn(
      "Standard weapon attacks require exactly one target."
    );

    return null;
  }

  const targetToken =
    targets[0];

  const targetActor =
    targetToken.actor;

  if (!targetActor) {

    ui.notifications.warn(
      "The targeted token has no Actor."
    );

    return null;
  }

  const targetUuid =
    targetToken.document?.uuid;

  if (!targetUuid) {

    ui.notifications.error(
      "Tactical | Could not determine the target UUID."
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Ammunition Pre-Check                        */
  /* -------------------------------------------- */

  const usesMagazine =
    system.usesMagazine !== false;

  const ammoBefore =
    usesMagazine
      ? Math.max(
          0,
          Number(
            system.ammoRemaining
          ) || 0
        )
      : null;

  /*
   * Empty weapons fail before the Action is
   * committed.
   */
  if (
    usesMagazine &&
    ammoBefore <= 0
  ) {

    ui.notifications.warn(
      `${weapon.name} is out of ammunition.`
    );

    return null;
  }

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
    attribute +
    skill;

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

  /*
   * Player canceled.
   * No Action is spent.
   */
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

  /*
   * GM canceled or rejected.
   * No Action, ammo, or Rank Die is spent.
   */
  if (!approval) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Spend Attack Action                         */
  /* -------------------------------------------- */

  if (inCombat) {

    /*
     * Re-check immediately before spending because
     * the Action state may have changed while the
     * GM approval dialog was open.
     */
    const actionState =
      await spendActions(
        actor,
        1,
        "Attack"
      );

    if (!actionState) {
      return null;
    }
  }

  /* -------------------------------------------- */
  /*  Spend Rank Die                              */
  /* -------------------------------------------- */

  if (
    playerOptions.rankDie
  ) {

    await actor.update({
      "system.rankDice.value":
        Math.max(
          0,
          availableRankDice - 1
        )
    });
  }

  /* -------------------------------------------- */
  /*  Consume Ammunition                          */
  /* -------------------------------------------- */

  let ammoAfter =
    null;

  if (usesMagazine) {

    ammoAfter =
      Math.max(
        0,
        ammoBefore - 1
      );

    await weapon.update({
      "system.ammoRemaining":
        ammoAfter
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
      Number(
        system.dps
      ) || 0
    );

  const penetration =
    Math.max(
      0,
      Number(
        system.penetration
      ) || 0
    );

  const rawDamage =
    result.successes *
    dps;

  /* -------------------------------------------- */
  /*  GM Damage Request                           */
  /* -------------------------------------------- */

  /*
   * A miss still consumes the Action, Rank Die,
   * and ammunition because the attack occurred.
   */
  if (
    result.successes > 0
  ) {

    await requestDamageApplication({
      attackerUuid:
        actor.uuid,

      attackerName:
        actor.name,

      weaponUuid:
        weapon.uuid,

      weaponName:
        weapon.name,

      targetUuid,

      successes:
        result.successes,

      criticalPoints:
        result.criticalPoints,

      dps,

      penetration
    });
  }

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    actorId:
      actor.id,

    actorUuid:
      actor.uuid,

    weaponId:
      weapon.id,

    weaponUuid:
      weapon.uuid,

    weaponName:
      weapon.name,

    targetId:
      targetActor.id,

    targetUuid,

    targetName:
      targetActor.name,

    attributeId,
    skillId,

    actionCost:
      inCombat
        ? 1
        : 0,

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
          ? ammoAfter
          : null,

      usesMagazine,

      intendedRange:
        system.intendedRange ??
        "short"
    },

    damage: {
      hit:
        result.successes > 0,

      successes:
        result.successes,

      criticalPoints:
        result.criticalPoints,

      dps,

      rawDamage,

      penetration
    }
  };
}
