/**
 * Tactical
 * Action Economy
 *
 * Core Tactical turn structure:
 *
 * - Each combatant starts their turn with 2 Actions.
 * - Standard actions normally cost 1 Action.
 * - Dash costs 2 Actions.
 * - Actions may be spent in any order.
 *
 * This module manages Action state only.
 * Individual combat actions decide their own costs.
 */

const FLAG_SCOPE =
  "tactical";

const FLAG_KEY =
  "actions";

/**
 * Get current Tactical Action state for an Actor.
 *
 * @param {Actor} actor
 *
 * @returns {object}
 */
export function getActionState(
  actor
) {

  if (!actor) {

    return {
      current: 0,
      max: 2
    };
  }

  const stored =
    actor.getFlag(
      FLAG_SCOPE,
      FLAG_KEY
    ) ?? {};

  const max =
    Math.max(
      0,
      Number(
        stored.max
      ) || 2
    );

  const current =
    Math.max(
      0,
      Math.min(
        max,
        Number(
          stored.current
        ) || 0
      )
    );

  return {
    current,
    max
  };
}

/**
 * Reset an Actor's Actions at the start
 * of their turn.
 *
 * @param {Actor} actor
 * @param {number} maxActions
 *
 * @returns {Promise<object>}
 */
export async function resetActions(
  actor,
  maxActions = 2
) {

  if (!actor) {
    throw new Error(
      "Tactical | Resetting Actions requires an Actor."
    );
  }

  const max =
    Math.max(
      0,
      Number(
        maxActions
      ) || 0
    );

  const state = {
    current:
      max,

    max
  };

  await actor.setFlag(
    FLAG_SCOPE,
    FLAG_KEY,
    state
  );

  return state;
}

/**
 * Determine whether an Actor can afford
 * an Action cost.
 *
 * @param {Actor} actor
 * @param {number} cost
 *
 * @returns {boolean}
 */
export function canSpendActions(
  actor,
  cost = 1
) {

  const required =
    Math.max(
      0,
      Number(
        cost
      ) || 0
    );

  const state =
    getActionState(
      actor
    );

  return (
    state.current >=
    required
  );
}

/**
 * Spend Actions.
 *
 * Returns null when the Actor does not have
 * enough Actions remaining.
 *
 * @param {Actor} actor
 * @param {number} cost
 * @param {string} label
 *
 * @returns {Promise<object|null>}
 */
export async function spendActions(
  actor,
  cost = 1,
  label = "Action"
) {

  if (!actor) {
    throw new Error(
      "Tactical | Spending Actions requires an Actor."
    );
  }

  const required =
    Math.max(
      0,
      Number(
        cost
      ) || 0
    );

  const state =
    getActionState(
      actor
    );

  if (
    state.current <
    required
  ) {

    ui.notifications.warn(
      `${actor.name} does not have enough Actions remaining for ${label}.`
    );

    return null;
  }

  const nextState = {
    current:
      state.current -
      required,

    max:
      state.max
  };

  await actor.setFlag(
    FLAG_SCOPE,
    FLAG_KEY,
    nextState
  );

  return nextState;
}

/**
 * Refund Actions.
 *
 * Useful if an Action was provisionally spent
 * but the resolution could not complete.
 *
 * @param {Actor} actor
 * @param {number} amount
 *
 * @returns {Promise<object>}
 */
export async function refundActions(
  actor,
  amount = 1
) {

  if (!actor) {
    throw new Error(
      "Tactical | Refunding Actions requires an Actor."
    );
  }

  const refund =
    Math.max(
      0,
      Number(
        amount
      ) || 0
    );

  const state =
    getActionState(
      actor
    );

  const nextState = {
    current:
      Math.min(
        state.max,
        state.current +
        refund
      ),

    max:
      state.max
  };

  await actor.setFlag(
    FLAG_SCOPE,
    FLAG_KEY,
    nextState
  );

  return nextState;
}
