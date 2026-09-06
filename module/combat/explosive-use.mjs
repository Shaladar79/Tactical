/**
 * Tactical
 * Explosive Consumable Use
 *
 * Resolves radius-based explosive damage.
 *
 * Flow:
 *
 * 1. Prepare the consumable use.
 * 2. Select the blast center.
 * 3. Find every token inside the blast radius.
 * 4. Determine Agility Save eligibility from cover.
 * 5. Resolve all eligible Agility Saves.
 * 6. Successful Saves reduce Raw Damage by half.
 * 7. Send each affected target through the normal
 *    GM-authoritative damage application flow.
 * 8. Commit the consumable use.
 *
 * Explosives affect all tokens in the blast area
 * regardless of Friendly, Hostile, or Neutral
 * disposition.
 */

import {
  prepareConsumableUse,
  commitConsumableUse
} from "./consumable-use.mjs";

import {
  selectAreaTargets,
  getTokensInArea
} from "../canvas/area-targeting.mjs";

import {
  hasQualifyingCover
} from "../canvas/cover-proximity.mjs";

import {
  rollActorSave
} from "../dice/actor-save.mjs";

import {
  requestDamageApplication
} from "../socket/damage-request-socket.mjs";

/* -------------------------------------------- */
/*  Constants                                   */
/* -------------------------------------------- */

const EXPLOSIVE_SAVE_ATTRIBUTE =
  "agility";

const EXPLOSIVE_SAVE_DAMAGE_MULTIPLIER =
  0.5;

const FULL_DAMAGE_MULTIPLIER =
  1;

const BASE_COVER_DISTANCE =
  1;

/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

/**
 * Get an Actor from a canvas Token.
 *
 * @param {Token} token
 *
 * @returns {Actor|null}
 */
function getTokenActor(token) {

  return (
    token?.actor ??
    token?.document?.actor ??
    null
  );
}

/**
 * Determine whether an Actor has the Attribute
 * required to make an explosive Agility Save.
 *
 * Actors without an Agility Attribute take full
 * explosive damage.
 *
 * This currently allows Vehicles or other actor
 * types without Tactical Save Attributes to be
 * damaged without throwing a Save error.
 *
 * @param {Actor} actor
 *
 * @returns {boolean}
 */
function canMakeExplosiveSave(actor) {

  return (
    actor?.system?.attributes?.[
      EXPLOSIVE_SAVE_ATTRIBUTE
    ] !== undefined
  );
}

/**
 * Normalize a set of Actor IDs that should spend
 * a Rank Die on their explosive Save.
 *
 * This allows a future UI or defender-choice
 * system to supply Rank Die decisions without
 * putting that UI logic inside explosive
 * resolution.
 *
 * @param {string[]|Set<string>} actorIds
 *
 * @returns {Set<string>}
 */
function normalizeRankDieActorIds(
  actorIds
) {

  if (actorIds instanceof Set) {
    return actorIds;
  }

  if (Array.isArray(actorIds)) {
    return new Set(actorIds);
  }

  return new Set();
}

/* -------------------------------------------- */
/*  Explosive Use                               */
/* -------------------------------------------- */

/**
 * Resolve use of an explosive Consumable.
 *
 * The actual attack/check that determines
 * successes may be resolved by another workflow.
 * This helper accepts those successes and handles
 * the resulting blast.
 *
 * @param {Actor} actor
 * Actor using the explosive.
 *
 * @param {Item} consumable
 * Explosive Consumable Item.
 *
 * @param {object} options
 *
 * @param {number} options.successes
 * Successes used to calculate explosive damage.
 *
 * @param {number} options.criticalPoints
 * Critical Points passed to the standard damage
 * and Wound pipeline.
 *
 * @param {object|null} options.center
 * Optional predetermined blast center.
 * If omitted, the user selects the center.
 *
 * @param {number} options.coverDistance
 * Base maximum distance from qualifying cover,
 * measured in grid squares.
 *
 * Default = 1.
 *
 * Future defender talents may increase this.
 *
 * @param {number} options.conditionalSaveBonus
 * Conditional bonus applied to explosive Saves.
 *
 * @param {number} options.saveDiceModifier
 * Other explosive Save dice modifiers.
 *
 * @param {string[]|Set<string>} options.rankDieActorIds
 * Actor IDs that should spend one Rank Die on
 * their explosive Save.
 *
 * @returns {Promise<object|null>}
 */
export async function useExplosiveConsumable(
  actor,
  consumable,
  {
    successes = 0,

    criticalPoints = 0,

    center = null,

    coverDistance =
      BASE_COVER_DISTANCE,

    conditionalSaveBonus = 0,

    saveDiceModifier = 0,

    rankDieActorIds = []
  } = {}
) {

  /* -------------------------------------------- */
  /*  Prepare Use                                 */
  /* -------------------------------------------- */

  const preparedUse =
    await prepareConsumableUse(
      actor,
      consumable
    );

  if (!preparedUse) {
    return null;
  }

  const effect =
    preparedUse.effect ??
    {};

  const blastRadius =
    Math.max(
      0,
      Number(
        effect.blastRadius ??
        consumable?.system?.blastRadius
      ) || 0
    );

  const dps =
    Math.max(
      0,
      Number(
        effect.dps ??
        consumable?.system?.dps
      ) || 0
    );

  const penetration =
    Math.max(
      0,
      Number(
        effect.penetration ??
        consumable?.system?.penetration
      ) || 0
    );

  const saveTN =
    Math.max(
      2,
      Math.min(
        12,
        Number(
          consumable?.system?.saveTN
        ) || 7
      )
    );

  const saveDifficulty =
    Math.max(
      1,
      Math.floor(
        Number(
          consumable?.system?.saveDifficulty
        ) || 1
      )
    );

  if (blastRadius <= 0) {

    ui.notifications.warn(
      `${consumable.name} does not have a valid blast radius.`
    );

    return null;
  }

  if (dps <= 0) {

    ui.notifications.warn(
      `${consumable.name} does not deal explosive damage.`
    );

    return null;
  }

  const attackSuccesses =
    Math.max(
      0,
      Number(successes) || 0
    );

  const attackCriticalPoints =
    Math.max(
      0,
      Number(criticalPoints) || 0
    );

  const allowedCoverDistance =
    Math.max(
      0,
      Number(coverDistance) || 0
    );

  const rankDieSet =
    normalizeRankDieActorIds(
      rankDieActorIds
    );

  /* -------------------------------------------- */
  /*  Select Blast Area                           */
  /* -------------------------------------------- */

  let blastCenter =
    center;

  let affectedTokens =
    [];

  if (blastCenter) {

    affectedTokens =
      getTokensInArea({
        center:
          blastCenter,

        radius:
          blastRadius,

        filter:
          "all"
      });
  }
  else {

    const selection =
      await selectAreaTargets({
        radius:
          blastRadius,

        filter:
          "all"
      });

    if (
      !selection ||
      selection.cancelled
    ) {
      return null;
    }

    blastCenter =
      selection.center;

    affectedTokens =
      selection.tokens ?? [];
  }

  if (
    !blastCenter ||
    !Number.isFinite(
      Number(blastCenter.x)
    ) ||
    !Number.isFinite(
      Number(blastCenter.y)
    )
  ) {

    ui.notifications.warn(
      "Tactical | Explosive use requires a valid blast center."
    );

    return null;
  }

  if (affectedTokens.length <= 0) {

    ui.notifications.info(
      `${consumable.name} has no targets inside its blast radius.`
    );

    /*
     * The explosive was still used even if no
     * token was caught in the blast.
     */
    const committedUse =
      await commitConsumableUse(
        consumable,
        preparedUse
      );

    return {
      committed:
        Boolean(committedUse),

      blastCenter,

      blastRadius,

      affectedTokens: [],

      targets: []
    };
  }

  /* -------------------------------------------- */
  /*  Build Target Records                        */
  /* -------------------------------------------- */

  const targetRecords =
    [];

  for (const token of affectedTokens) {

    const targetActor =
      getTokenActor(
        token
      );

    if (!targetActor) {
      continue;
    }

    const hasCover =
      hasQualifyingCover({
        source:
          blastCenter,

        token,

        maxDistance:
          allowedCoverDistance
      });

    const saveCapable =
      canMakeExplosiveSave(
        targetActor
      );

    targetRecords.push({
      token,
      actor:
        targetActor,

      hasCover,

      saveCapable,

      eligibleForSave:
        hasCover &&
        saveCapable,

      saveResult:
        null,

      damageMultiplier:
        FULL_DAMAGE_MULTIPLIER
    });
  }

  /* -------------------------------------------- */
  /*  Resolve Saves First                         */
  /* -------------------------------------------- */

  /*
   * All Saves are resolved before any damage is
   * dispatched.
   *
   * This prevents a cancelled Save from producing
   * a partially resolved explosion where earlier
   * targets have already received damage.
   */
  for (const target of targetRecords) {

    if (!target.eligibleForSave) {
      continue;
    }

    const useRankDie =
      rankDieSet.has(
        target.actor.id
      );

    const saveResult =
      await rollActorSave(
        target.actor,
        {
          attributeId:
            EXPLOSIVE_SAVE_ATTRIBUTE,

          conditionalBonus:
            conditionalSaveBonus,

          rankDie:
            useRankDie,

          diceModifier:
            saveDiceModifier,

          baseTN:
            saveTN,

          difficulty:
            saveDifficulty,

          flavor:
            `${consumable.name} — Agility Save`
        }
      );

    /*
     * A null result means the Save resolution was
     * cancelled or rejected.
     *
     * Abort before any explosive damage is sent.
     */
    if (!saveResult) {

      ui.notifications.info(
        `${consumable.name} resolution cancelled before damage was applied.`
      );

      return null;
    }

    target.saveResult =
      saveResult;

    if (saveResult.passed) {

      target.damageMultiplier =
        EXPLOSIVE_SAVE_DAMAGE_MULTIPLIER;
    }
  }

  /* -------------------------------------------- */
  /*  Apply Damage                                */
  /* -------------------------------------------- */

  for (const target of targetRecords) {

    await requestDamageApplication({
      attackerUuid:
        actor.uuid,

      attackerName:
        actor.name,

      weaponUuid:
        consumable.uuid,

      weaponName:
        consumable.name,

      targetUuid:
        target.token.document?.uuid ??
        target.actor.uuid,

      successes:
        attackSuccesses,

      criticalPoints:
        attackCriticalPoints,

      dps,

      damageMultiplier:
        target.damageMultiplier,

      penetration
    });
  }

  /* -------------------------------------------- */
  /*  Commit Consumable                           */
  /* -------------------------------------------- */

  const committedUse =
    await commitConsumableUse(
      consumable,
      preparedUse
    );

  if (!committedUse) {

    ui.notifications.error(
      `Tactical | ${consumable.name} resolved, but its consumable transaction could not be committed.`
    );

    return {
      committed:
        false,

      blastCenter,

      blastRadius,

      targets:
        targetRecords
    };
  }

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    committed:
      true,

    blastCenter,

    blastRadius,

    successes:
      attackSuccesses,

    criticalPoints:
      attackCriticalPoints,

    dps,

    penetration,

    saveTN,

    saveDifficulty,

    coverDistance:
      allowedCoverDistance,

    affectedTokens,

    targets:
      targetRecords.map(
        target => ({
          token:
            target.token,

          actor:
            target.actor,

          hasCover:
            target.hasCover,

          saveCapable:
            target.saveCapable,

          eligibleForSave:
            target.eligibleForSave,

          saveResult:
            target.saveResult,

          damageMultiplier:
            target.damageMultiplier
        })
      )
  };
}
