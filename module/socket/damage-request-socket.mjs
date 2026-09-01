/**
 * Tactical
 * Damage Request Socket
 *
 * Player attack result
 *      ↓
 * GM receives damage request
 *      ↓
 * GM client reads current target defenses
 *      ↓
 * Damage + Wound resolution
 *      ↓
 * Determine post-damage combat state
 *      ↓
 * GM confirms
 *      ↓
 * Target is updated automatically
 *      ↓
 * Appropriate Tactical statuses are applied
 */

import {
  resolveTacticalDamage
} from "../combat/damage-resolver.mjs";

import {
  resolveTacticalWound
} from "../combat/wound-resolver.mjs";

import {
  applyTacticalStatus,
  removeTacticalStatus
} from "../status/foundry-status-effects.mjs";

const SOCKET_NAME = "system.tactical";

/* -------------------------------------------- */
/*  Primary GM                                  */
/* -------------------------------------------- */

function getPrimaryActiveGM() {

  const activeGMs = game.users
    .filter(
      user =>
        user.active &&
        user.isGM
    )
    .sort(
      (a, b) =>
        a.id.localeCompare(b.id)
    );

  return activeGMs[0] ?? null;
}

/* -------------------------------------------- */
/*  Post-Damage State                           */
/* -------------------------------------------- */

/**
 * Determine the target's resulting combat state.
 */
function determinePostDamageState({
  actorType = "",
  healthAfter = 0,
  woundsAfter = null,
  maxWounds = null
} = {}) {

  const isVehicle =
    actorType === "vehicle";

  const isTrooper =
    actorType === "trooper";

  /* -------------------------------------------- */
  /*  Vehicle                                     */
  /* -------------------------------------------- */

  if (isVehicle) {

    if (healthAfter <= 0) {
      return {
        id: "disabled",
        label: "Disabled"
      };
    }

    return {
      id: "active",
      label: "Active"
    };
  }

  /* -------------------------------------------- */
  /*  Trooper                                     */
  /* -------------------------------------------- */

  if (isTrooper) {

    if (healthAfter <= 0) {
      return {
        id: "defeated",
        label: "Defeated"
      };
    }

    return {
      id: "active",
      label: "Active"
    };
  }

  /* -------------------------------------------- */
  /*  Wound Death                                 */
  /* -------------------------------------------- */

  if (
    maxWounds !== null &&
    woundsAfter !== null &&
    maxWounds > 0 &&
    woundsAfter >= maxWounds
  ) {

    return {
      id: "dead",
      label: "Dead"
    };
  }

  /* -------------------------------------------- */
  /*  Zero Health                                 */
  /* -------------------------------------------- */

  if (healthAfter <= 0) {

    return {
      id: "bleeding-out",
      label: "Unconscious + Bleeding Out"
    };
  }

  /* -------------------------------------------- */
  /*  Active                                      */
  /* -------------------------------------------- */

  return {
    id: "active",
    label: "Active"
  };
}

/* -------------------------------------------- */
/*  Apply Post-Damage Statuses                  */
/* -------------------------------------------- */

/**
 * Apply Tactical statuses caused by the final
 * approved damage result.
 *
 * Dead / Defeated / Disabled are not Foundry
 * statuses yet, so those states remain informational
 * until their dedicated handling is added.
 */
async function applyPostDamageStatuses(
  actor,
  combatState
) {

  if (
    !actor ||
    !combatState
  ) {
    return;
  }

  /* -------------------------------------------- */
  /*  Bleeding Out                                */
  /* -------------------------------------------- */

  if (
    combatState.id ===
    "bleeding-out"
  ) {

    /*
     * A character beginning to Bleed Out cannot
     * simultaneously remain Stable.
     */
    await removeTacticalStatus(
      actor,
      "stable"
    );

    await applyTacticalStatus(
      actor,
      "unconscious"
    );

    await applyTacticalStatus(
      actor,
      "bleeding-out"
    );

    return;
  }

  /* -------------------------------------------- */
  /*  Death                                       */
  /* -------------------------------------------- */

  if (
    combatState.id ===
    "dead"
  ) {

    /*
     * Dead actors should no longer retain
     * Bleeding Out or Stable.
     *
     * A dedicated Dead status can be added later.
     */
    await removeTacticalStatus(
      actor,
      "bleeding-out"
    );

    await removeTacticalStatus(
      actor,
      "stable"
    );

    await applyTacticalStatus(
      actor,
      "unconscious"
    );
  }
}

/* -------------------------------------------- */
/*  Registration                                */
/* -------------------------------------------- */

export function registerTacticalDamageSocket() {

  game.socket.on(
    SOCKET_NAME,
    handleDamageSocketMessage
  );

  console.log(
    "Tactical | Damage request socket registered"
  );
}

/* -------------------------------------------- */
/*  Request Damage                              */
/* -------------------------------------------- */

/**
 * Request GM approval to apply attack damage.
 *
 * @param {object} options
 * @param {string} options.attackerUuid
 * @param {string} options.attackerName
 * @param {string} options.weaponUuid
 * @param {string} options.weaponName
 * @param {string} options.targetUuid
 * @param {number} options.successes
 * @param {number} options.criticalPoints
 * @param {number} options.dps
 * @param {number} options.penetration
 *
 * @returns {Promise<void>}
 */
export async function requestDamageApplication({
  attackerUuid = "",
  attackerName = "Attacker",

  weaponUuid = "",
  weaponName = "Attack",

  targetUuid = "",

  successes = 0,
  criticalPoints = 0,

  dps = 0,
  penetration = 0
} = {}) {

  if (!targetUuid) {

    ui.notifications.warn(
      "Tactical | Damage application requires a target."
    );

    return;
  }

  const primaryGM =
    getPrimaryActiveGM();

  if (!primaryGM) {

    ui.notifications.warn(
      "A GM must be connected to apply damage."
    );

    return;
  }

  const request = {
    type:
      "damageRequest",

    targetGMId:
      primaryGM.id,

    requestingUserId:
      game.user.id,

    attackerUuid,
    attackerName,

    weaponUuid,
    weaponName,

    targetUuid,

    successes:
      Math.max(
        0,
        Number(successes) || 0
      ),

    criticalPoints:
      Math.max(
        0,
        Number(criticalPoints) || 0
      ),

    dps:
      Math.max(
        0,
        Number(dps) || 0
      ),

    penetration:
      Math.max(
        0,
        Number(penetration) || 0
      )
  };

  if (
    game.user.isGM &&
    game.user.id === primaryGM.id
  ) {

    await handleDamageRequest(
      request
    );

    return;
  }

  game.socket.emit(
    SOCKET_NAME,
    request
  );
}

/* -------------------------------------------- */
/*  Socket Routing                              */
/* -------------------------------------------- */

async function handleDamageSocketMessage(message) {

  if (
    message?.type !==
    "damageRequest"
  ) {
    return;
  }

  await handleDamageRequest(
    message
  );
}

/* -------------------------------------------- */
/*  GM Damage Handling                          */
/* -------------------------------------------- */

async function handleDamageRequest(message) {

  if (!game.user.isGM) {
    return;
  }

  if (
    message.targetGMId !==
    game.user.id
  ) {
    return;
  }

  /* -------------------------------------------- */
  /*  Resolve Target                              */
  /* -------------------------------------------- */

  const targetDocument =
    await fromUuid(
      message.targetUuid
    );

  if (!targetDocument) {

    ui.notifications.error(
      "Tactical | Damage target could not be found."
    );

    return;
  }

  const targetActor =
    targetDocument.actor ??
    targetDocument;

  if (!targetActor?.system) {

    ui.notifications.error(
      "Tactical | Damage target has no valid Actor data."
    );

    return;
  }

  const system =
    targetActor.system;

  /* -------------------------------------------- */
  /*  Health / Hull                               */
  /* -------------------------------------------- */

  const isVehicle =
    targetActor.type === "vehicle";

  const healthResource =
    isVehicle
      ? system.hull
      : system.health;

  if (!healthResource) {

    ui.notifications.error(
      `${targetActor.name} has no valid ${isVehicle ? "Hull" : "Health"} resource.`
    );

    return;
  }

  const currentHealth =
    Math.max(
      0,
      Number(
        healthResource.value
      ) || 0
    );

  const maxHealth =
    Math.max(
      0,
      Number(
        healthResource.max
      ) || 0
    );

  const toughness =
    Math.max(
      0,
      Number(
        system.toughness
      ) || 0
    );

  const integrity =
    Math.max(
      0,
      Number(
        system.armorIntegrity?.value
      ) || 0
    );

  /* -------------------------------------------- */
  /*  Damage Resolution                           */
  /* -------------------------------------------- */

  const damageResult =
    resolveTacticalDamage({
      successes:
        message.successes,

      dps:
        message.dps,

      penetration:
        message.penetration,

      toughness,

      integrity,

      health:
        currentHealth
    });

  /* -------------------------------------------- */
  /*  Wound Resolution                            */
  /* -------------------------------------------- */

  const supportsWounds =
    targetActor.type !== "trooper" &&
    targetActor.type !== "vehicle" &&
    Boolean(system.wounds);

  let woundResult =
    null;

  if (supportsWounds) {

    woundResult =
      resolveTacticalWound({
        criticalPoints:
          message.criticalPoints,

        healthDamage:
          damageResult.health.damage,

        maxHealth,

        currentWounds:
          system.wounds.value,

        maxWounds:
          system.wounds.max
      });
  }

  /* -------------------------------------------- */
  /*  Post-Damage State                           */
  /* -------------------------------------------- */

  const woundsAfter =
    woundResult
      ? woundResult.wounds.after
      : null;

  const maxWounds =
    supportsWounds
      ? Math.max(
          0,
          Number(
            system.wounds.max
          ) || 0
        )
      : null;

  const combatState =
    determinePostDamageState({
      actorType:
        targetActor.type,

      healthAfter:
        damageResult.health.after,

      woundsAfter,

      maxWounds
    });

  /* -------------------------------------------- */
  /*  GM Confirmation                             */
  /* -------------------------------------------- */

  const woundText =
    woundResult
      ? `
        <p>
          <strong>Wounds:</strong>
          +${woundResult.wounds.applied}
        </p>

        <p>
          <strong>New Wounds:</strong>
          ${woundResult.wounds.after}
          /
          ${woundResult.wounds.max}
        </p>
      `
      : "";

  const confirmed =
    await foundry.applications.api.DialogV2.confirm({
      window: {
        title:
          "Apply Tactical Damage"
      },

      content: `
        <div class="tactical-damage-confirm">

          <p>
            <strong>Attacker:</strong>
            ${message.attackerName}
          </p>

          <p>
            <strong>Attack:</strong>
            ${message.weaponName}
          </p>

          <p>
            <strong>Target:</strong>
            ${targetActor.name}
          </p>

          <hr>

          <p>
            <strong>Successes:</strong>
            ${message.successes}
          </p>

          <p>
            <strong>Critical Points:</strong>
            ${message.criticalPoints}
          </p>

          <p>
            <strong>DPS:</strong>
            ${message.dps}
          </p>

          <p>
            <strong>Raw Damage:</strong>
            ${damageResult.rawDamage}
          </p>

          <p>
            <strong>Penetration:</strong>
            ${message.penetration}
          </p>

          <hr>

          <p>
            <strong>Toughness:</strong>
            ${damageResult.toughness.original}
            →
            ${damageResult.toughness.effective}
          </p>

          <p>
            <strong>Damage Prevented by Toughness:</strong>
            ${damageResult.toughness.prevented}
          </p>

          <p>
            <strong>Armor Integrity Damage:</strong>
            ${damageResult.integrity.damage}
          </p>

          <p>
            <strong>${isVehicle ? "Hull" : "Health"} Damage:</strong>
            ${damageResult.health.damage}
          </p>

          ${woundText}

          <hr>

          <p>
            <strong>New Armor Integrity:</strong>
            ${damageResult.integrity.after}
          </p>

          <p>
            <strong>New ${isVehicle ? "Hull" : "Health"}:</strong>
            ${damageResult.health.after}
          </p>

          <p>
            <strong>Resulting State:</strong>
            ${combatState.label}
          </p>

        </div>
      `,

      yes: {
        label:
          "Apply Damage"
      },

      no: {
        label:
          "Cancel"
      },

      modal:
        true
    });

  if (!confirmed) {
    return;
  }

  /* -------------------------------------------- */
  /*  Build Update                                */
  /* -------------------------------------------- */

  const updateData = {
    "system.armorIntegrity.value":
      damageResult.integrity.after
  };

  if (isVehicle) {

    updateData[
      "system.hull.value"
    ] =
      damageResult.health.after;
  }
  else {

    updateData[
      "system.health.value"
    ] =
      damageResult.health.after;
  }

  if (woundResult) {

    updateData[
      "system.wounds.value"
    ] =
      woundResult.wounds.after;
  }

  /* -------------------------------------------- */
  /*  Apply Damage Update                         */
  /* -------------------------------------------- */

  await targetActor.update(
    updateData
  );

  /* -------------------------------------------- */
  /*  Apply Resulting Statuses                    */
  /* -------------------------------------------- */

  await applyPostDamageStatuses(
    targetActor,
    combatState
  );

  /* -------------------------------------------- */
  /*  Notification                                */
  /* -------------------------------------------- */

  ui.notifications.info(
    `Applied damage to ${targetActor.name}. Result: ${combatState.label}.`
  );
}
