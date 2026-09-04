/**
 * Tactical
 * Overwatch Reaction
 *
 * Resolves an Overwatch reaction attack.
 *
 * Overwatch reaction attacks:
 *
 * - cost 0 Actions
 * - occur outside the Actor's normal turn
 * - suffer -1d12
 * - consume ammunition normally
 * - clear Overwatch after the shot
 */

import {
  buildTacticalPool
} from "../dice/build-pool.mjs";

import {
  rollTacticalPool
} from "../dice/tactical-roll.mjs";

import {
  requestGMTNApproval
} from "../socket/roll-request-socket.mjs";

import {
  requestDamageApplication
} from "../socket/damage-request-socket.mjs";

import {
  getOverwatchState,
  clearOverwatch
} from "./overwatch-action.mjs";

/**
 * Resolve an Overwatch reaction attack.
 *
 * Default ranged pairing:
 *
 * Aim + Ranged
 *
 * @param {Actor} actor
 * Actor making the reaction attack.
 *
 * @param {Token} targetToken
 * Token whose movement triggered Overwatch.
 *
 * @returns {Promise<object|null>}
 */
export async function resolveOverwatchReaction(
  actor,
  targetToken
) {

  /* -------------------------------------------- */
  /*  Validation                                  */
  /* -------------------------------------------- */

  if (!actor) {
    throw new Error(
      "Tactical | Overwatch reaction requires an Actor."
    );
  }

  if (!targetToken) {
    throw new Error(
      "Tactical | Overwatch reaction requires a target Token."
    );
  }

  const targetActor =
    targetToken.actor;

  if (!targetActor) {

    ui.notifications.warn(
      "The Overwatch target has no Actor."
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Overwatch State                             */
  /* -------------------------------------------- */

  const overwatch =
    getOverwatchState(actor);

  if (
    !overwatch ||
    overwatch.active !== true
  ) {
    return null;
  }

  if (
    overwatch.reactionUsed === true
  ) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Weapon                                      */
  /* -------------------------------------------- */

  let weapon =
    null;

  if (
    overwatch.weaponId
  ) {

    weapon =
      actor.items.get(
        overwatch.weaponId
      ) ?? null;
  }

  if (
    !weapon &&
    overwatch.weaponUuid
  ) {

    const resolved =
      await fromUuid(
        overwatch.weaponUuid
      );

    if (
      resolved?.type === "weapon"
    ) {
      weapon =
        resolved;
    }
  }

  if (
    !weapon ||
    weapon.type !== "weapon"
  ) {

    await clearOverwatch(actor);

    ui.notifications.warn(
      `${actor.name}'s Overwatch weapon could not be found.`
    );

    return null;
  }

  const system =
    weapon.system;

  /* -------------------------------------------- */
  /*  Ammunition                                  */
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

  if (
    usesMagazine &&
    ammoBefore <= 0
  ) {

    await clearOverwatch(actor);

    ui.notifications.warn(
      `${weapon.name} is out of ammunition.`
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Attack Pool                                 */
  /* -------------------------------------------- */

  const attribute =
    Math.max(
      0,
      Number(
        actor.system.attributes?.aim
      ) || 0
    );

  const skill =
    Math.max(
      0,
      Number(
        actor.system.skills?.ranged
      ) || 0
    );

  /*
   * Overwatch applies a fixed -1d12.
   */
  const poolData =
    buildTacticalPool({
      attribute,
      skill,

      specialization:
        false,

      rankDie:
        false,

      modifier:
        -1
    });

  /* -------------------------------------------- */
  /*  GM TN Approval                              */
  /* -------------------------------------------- */

  const rollName =
    `${actor.name}: Overwatch with ${weapon.name}`;

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

      rangeOverrides:
        system.rangeOverrides ?? {}
    });

  /*
   * If GM cancels the reaction, preserve Overwatch.
   */
  if (!approval) {
    return null;
  }

  /* -------------------------------------------- */
  /*  Mark Reaction Used                          */
  /* -------------------------------------------- */

  await actor.setFlag(
    "tactical",
    "overwatch",
    {
      ...overwatch,

      reactionUsed:
        true
    }
  );

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
  /*  Damage Data                                 */
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
  /*  Damage Request                              */
  /* -------------------------------------------- */

  const targetUuid =
    targetToken.document?.uuid;

  if (
    result.successes > 0 &&
    targetUuid
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
  /*  Clear Overwatch                             */
  /* -------------------------------------------- */

  await clearOverwatch(
    actor
  );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    success:
      true,

    actorId:
      actor.id,

    targetId:
      targetActor.id,

    weaponId:
      weapon.id,

    actionCost:
      0,

    reaction:
      true,

    poolPenalty:
      -1,

    roll:
      result,

    targetNumber: {
      base:
        approval.baseTN,

      modifier:
        approval.tnModifier,

      final:
        approval.finalTN
    },

    weapon: {
      dps,

      penetration,

      ammoRemaining:
        usesMagazine
          ? ammoAfter
          : null
    },

    damage: {
      hit:
        result.successes > 0,

      successes:
        result.successes,

      criticalPoints:
        result.criticalPoints,

      rawDamage,

      penetration
    }
  };
}
