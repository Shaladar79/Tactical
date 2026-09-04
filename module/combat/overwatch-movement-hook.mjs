/**
 * Tactical
 * Overwatch Movement Hook
 *
 * Detects Token movement and checks whether
 * enemy Actors currently on Overwatch should
 * make a Reaction attack.
 *
 * First-pass behavior:
 *
 * - only runs during active combat
 * - only the primary active GM resolves triggers
 * - moved Token must be a combatant
 * - allies do not trigger each other
 * - each eligible Overwatch Actor may react once
 *
 * Precise LOS and weapon-range automation will
 * be layered in separately.
 */

import {
  isActorOnOverwatch
} from "./overwatch-action.mjs";

import {
  resolveOverwatchReaction
} from "./overwatch-reaction.mjs";

/* -------------------------------------------- */
/*  GM Authority                                */
/* -------------------------------------------- */

/**
 * Determine the authoritative active GM.
 *
 * This prevents multiple connected GMs from
 * resolving the same Overwatch trigger.
 *
 * @returns {User|null}
 */
function getPrimaryActiveGM() {

  const activeGMs =
    game.users
      .filter(
        user =>
          user.active &&
          user.isGM
      )
      .sort(
        (a, b) =>
          String(a.id).localeCompare(
            String(b.id)
          )
      );

  return activeGMs[0] ?? null;
}

/* -------------------------------------------- */
/*  Combat Helpers                              */
/* -------------------------------------------- */

function getCombatantForTokenDocument(
  tokenDocument,
  combat
) {

  if (
    !tokenDocument ||
    !combat
  ) {
    return null;
  }

  /*
   * TokenDocument exposes its current Combatant
   * directly in Foundry v14, but we retain a
   * fallback search for safety.
   */
  if (
    tokenDocument.combatant &&
    tokenDocument.combatant.parent?.id === combat.id
  ) {
    return tokenDocument.combatant;
  }

  return combat.combatants.find(
    combatant =>
      combatant.tokenId ===
      tokenDocument.id
  ) ?? null;
}

/**
 * Determine whether two Tokens should be treated
 * as hostile for automatic Overwatch triggering.
 *
 * Foundry disposition convention:
 *
 * positive = friendly
 * zero     = neutral
 * negative = hostile
 *
 * Neutral Tokens do not automatically trigger
 * Overwatch in this first pass.
 */
function areHostile(
  overwatcherToken,
  movedToken
) {

  const overwatcherDisposition =
    Number(
      overwatcherToken?.disposition
    ) || 0;

  const movedDisposition =
    Number(
      movedToken?.disposition
    ) || 0;

  if (
    overwatcherDisposition === 0 ||
    movedDisposition === 0
  ) {
    return false;
  }

  return (
    Math.sign(
      overwatcherDisposition
    ) !==
    Math.sign(
      movedDisposition
    )
  );
}

/* -------------------------------------------- */
/*  Hook Registration                           */
/* -------------------------------------------- */

/**
 * Register automatic Overwatch movement triggers.
 */
export function registerOverwatchMovementHook() {

  Hooks.on(
    "moveToken",
    async (
      tokenDocument,
      movement,
      operation,
      user
    ) => {

      /* -------------------------------------------- */
      /*  Primary GM Only                             */
      /* -------------------------------------------- */

      const primaryGM =
        getPrimaryActiveGM();

      if (
        !primaryGM ||
        game.user.id !== primaryGM.id
      ) {
        return;
      }

      /* -------------------------------------------- */
      /*  Active Combat                               */
      /* -------------------------------------------- */

      const combat =
        game.combat;

      if (!combat) {
        return;
      }

      /*
       * Ignore movement on another Scene.
       */
      if (
        combat.scene?.id &&
        tokenDocument.parent?.id !==
          combat.scene.id
      ) {
        return;
      }

      /* -------------------------------------------- */
      /*  Moving Combatant                            */
      /* -------------------------------------------- */

      const movedCombatant =
        getCombatantForTokenDocument(
          tokenDocument,
          combat
        );

      if (!movedCombatant) {
        return;
      }

      const movedActor =
        tokenDocument.actor;

      if (!movedActor) {
        return;
      }

      /*
       * Use the rendered Token as the reaction
       * target because resolveOverwatchReaction()
       * expects a Token placeable.
       */
      const movedToken =
        tokenDocument.object;

      if (!movedToken) {
        return;
      }

      /* -------------------------------------------- */
      /*  Find Eligible Overwatchers                  */
      /* -------------------------------------------- */

      const eligible = [];

      for (
        const combatant of combat.combatants
      ) {

        if (
          combatant.id ===
          movedCombatant.id
        ) {
          continue;
        }

        const actor =
          combatant.actor;

        if (!actor) {
          continue;
        }

        if (
          !isActorOnOverwatch(
            actor
          )
        ) {
          continue;
        }

        const overwatcherToken =
          combatant.token;

        if (!overwatcherToken) {
          continue;
        }

        if (
          !areHostile(
            overwatcherToken,
            tokenDocument
          )
        ) {
          continue;
        }

        eligible.push({
          actor,
          combatant
        });
      }

      if (
        eligible.length === 0
      ) {
        return;
      }

      /* -------------------------------------------- */
      /*  Resolve Reactions                           */
      /* -------------------------------------------- */

      for (
        const entry of eligible
      ) {

        /*
         * Re-check immediately before resolving.
         *
         * A prior Reaction may have changed state.
         */
        if (
          !isActorOnOverwatch(
            entry.actor
          )
        ) {
          continue;
        }

        await resolveOverwatchReaction(
          entry.actor,
          movedToken
        );
      }
    }
  );

  console.log(
    "Tactical | Overwatch movement hook registered"
  );
}
