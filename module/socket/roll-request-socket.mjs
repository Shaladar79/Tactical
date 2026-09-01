/**
 * Tactical
 * Roll Request Socket
 *
 * Handles player-to-GM requests for Tactical rolls.
 *
 * Supported request types:
 *
 * - check
 * - attack
 */

import {
  promptGMTNModifiers
} from "../dice/gm-tn-dialog.mjs";

import {
  promptGMAttackTN
} from "../dice/gm-attack-tn-dialog.mjs";

/**
 * Tactical system socket namespace.
 */
const SOCKET_NAME = "system.tactical";

/**
 * Pending roll requests on this client.
 *
 * requestId -> resolve function
 */
const pendingRollRequests = new Map();

/* -------------------------------------------- */
/*  Primary GM                                  */
/* -------------------------------------------- */

/**
 * Determine which connected GM should handle
 * roll approval requests.
 *
 * Using one deterministic GM prevents multiple
 * GM clients from opening the same dialog.
 *
 * @returns {User|null}
 */
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
/*  Request ID                                  */
/* -------------------------------------------- */

/**
 * Create a unique roll request ID.
 *
 * @returns {string}
 */
function createRequestId() {

  return foundry.utils.randomID();
}

/* -------------------------------------------- */
/*  Socket Registration                         */
/* -------------------------------------------- */

/**
 * Register Tactical socket listeners.
 *
 * Call this during the Foundry ready hook.
 */
export function registerTacticalRollSocket() {

  game.socket.on(
    SOCKET_NAME,
    handleSocketMessage
  );

  console.log(
    "Tactical | Roll request socket registered"
  );
}

/* -------------------------------------------- */
/*  Send Roll Request                           */
/* -------------------------------------------- */

/**
 * Request GM approval for a Tactical roll.
 *
 * @param {object} options
 *
 * @param {"check"|"attack"} options.requestType
 * Type of roll being requested.
 *
 * @param {string} options.actorName
 * Name of the Actor performing the roll.
 *
 * @param {string} options.rollName
 * Display name of the roll.
 *
 * @param {number} options.baseTN
 * Base Target Number.
 *
 * @param {number} options.dicePool
 * Final proposed dice pool before rolling.
 *
 * @param {object} options.rangeOverrides
 * Optional weapon-specific range TN modifiers.
 *
 * @returns {Promise<object|null>}
 */
export async function requestGMTNApproval({
  requestType = "check",

  actorName = "Character",
  rollName = "Tactical Check",

  baseTN = 7,
  dicePool = 0,

  rangeOverrides = {}
} = {}) {

  const normalizedRequestType =
    requestType === "attack"
      ? "attack"
      : "check";

  const normalizedBaseTN =
    Math.max(
      2,
      Math.min(
        12,
        Number(baseTN) || 7
      )
    );

  const normalizedDicePool =
    Math.max(
      0,
      Number(dicePool) || 0
    );

  /* -------------------------------------------- */
  /*  GM Rolling Locally                         */
  /* -------------------------------------------- */

  if (game.user.isGM) {

    if (normalizedRequestType === "attack") {

      return promptGMAttackTN({
        actorName,

        attackName:
          rollName,

        baseTN:
          normalizedBaseTN,

        dicePool:
          normalizedDicePool,

        rangeOverrides
      });
    }

    return promptGMTNModifiers({
      actorName,
      rollName,

      baseTN:
        normalizedBaseTN,

      dicePool:
        normalizedDicePool
    });
  }

  /* -------------------------------------------- */
  /*  Find Active GM                             */
  /* -------------------------------------------- */

  const primaryGM =
    getPrimaryActiveGM();

  if (!primaryGM) {

    ui.notifications.warn(
      "A GM must be connected to approve this roll."
    );

    return null;
  }

  /* -------------------------------------------- */
  /*  Create Request                             */
  /* -------------------------------------------- */

  const requestId =
    createRequestId();

  const request = {
    type: "rollRequest",

    requestType:
      normalizedRequestType,

    requestId,

    requestingUserId:
      game.user.id,

    targetGMId:
      primaryGM.id,

    actorName,
    rollName,

    baseTN:
      normalizedBaseTN,

    dicePool:
      normalizedDicePool,

    rangeOverrides: {
      ...rangeOverrides
    }
  };

  /* -------------------------------------------- */
  /*  Wait for GM Response                       */
  /* -------------------------------------------- */

  const responsePromise =
    new Promise(resolve => {

      pendingRollRequests.set(
        requestId,
        resolve
      );
    });

  game.socket.emit(
    SOCKET_NAME,
    request
  );

  return responsePromise;
}

/* -------------------------------------------- */
/*  Handle Socket Message                       */
/* -------------------------------------------- */

/**
 * Route incoming Tactical socket messages.
 *
 * @param {object} message
 */
async function handleSocketMessage(message) {

  if (!message?.type) {
    return;
  }

  switch (message.type) {

    case "rollRequest":
      await handleRollRequest(message);
      break;

    case "rollResponse":
      handleRollResponse(message);
      break;
  }
}

/* -------------------------------------------- */
/*  GM Handles Request                          */
/* -------------------------------------------- */

/**
 * Handle an incoming player roll request.
 *
 * Only the designated GM processes it.
 *
 * @param {object} message
 */
async function handleRollRequest(message) {

  if (!game.user.isGM) {
    return;
  }

  if (message.targetGMId !== game.user.id) {
    return;
  }

  const requestType =
    message.requestType === "attack"
      ? "attack"
      : "check";

  let approval = null;

  /* -------------------------------------------- */
  /*  Attack Approval                            */
  /* -------------------------------------------- */

  if (requestType === "attack") {

    approval =
      await promptGMAttackTN({
        title:
          "Player Attack Request",

        actorName:
          message.actorName,

        attackName:
          message.rollName,

        baseTN:
          message.baseTN,

        dicePool:
          message.dicePool,

        rangeOverrides:
          message.rangeOverrides ?? {}
      });
  }

  /* -------------------------------------------- */
  /*  Normal Check Approval                      */
  /* -------------------------------------------- */

  else {

    approval =
      await promptGMTNModifiers({
        title:
          "Player Roll Request",

        actorName:
          message.actorName,

        rollName:
          message.rollName,

        baseTN:
          message.baseTN,

        dicePool:
          message.dicePool
      });
  }

  /* -------------------------------------------- */
  /*  GM Cancelled                               */
  /* -------------------------------------------- */

  if (!approval) {

    game.socket.emit(
      SOCKET_NAME,
      {
        type:
          "rollResponse",

        requestId:
          message.requestId,

        requestingUserId:
          message.requestingUserId,

        approved:
          false
      }
    );

    return;
  }

  /* -------------------------------------------- */
  /*  GM Approved                                */
  /* -------------------------------------------- */

  game.socket.emit(
    SOCKET_NAME,
    {
      type:
        "rollResponse",

      requestType,

      requestId:
        message.requestId,

      requestingUserId:
        message.requestingUserId,

      approved:
        true,

      baseTN:
        approval.baseTN,

      tnModifier:
        approval.tnModifier,

      finalTN:
        approval.finalTN,

      modifiers:
        approval.modifiers ?? {},

      breakdown:
        approval.breakdown ?? {},

      range:
        approval.range ?? null
    }
  );
}

/* -------------------------------------------- */
/*  Player Receives Response                    */
/* -------------------------------------------- */

/**
 * Resolve the pending request on the client
 * that originally requested the roll.
 *
 * @param {object} message
 */
function handleRollResponse(message) {

  if (
    message.requestingUserId !==
    game.user.id
  ) {
    return;
  }

  const resolve =
    pendingRollRequests.get(
      message.requestId
    );

  if (!resolve) {
    return;
  }

  pendingRollRequests.delete(
    message.requestId
  );

  /* -------------------------------------------- */
  /*  Cancelled by GM                            */
  /* -------------------------------------------- */

  if (!message.approved) {

    ui.notifications.info(
      "The GM cancelled the roll."
    );

    resolve(null);

    return;
  }

  /* -------------------------------------------- */
  /*  Approved                                   */
  /* -------------------------------------------- */

  resolve({
    approved:
      true,

    requestType:
      message.requestType ?? "check",

    baseTN:
      message.baseTN,

    tnModifier:
      message.tnModifier,

    finalTN:
      message.finalTN,

    modifiers:
      message.modifiers ?? {},

    breakdown:
      message.breakdown ?? {},

    range:
      message.range ?? null
  });
}
