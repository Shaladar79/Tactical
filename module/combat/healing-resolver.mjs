/**
 * Tactical
 * Healing Resolver
 *
 * Resolves normal biological Health recovery.
 *
 * Wound removal is intentionally not handled here.
 * Specific sources such as Medkits may remove Wounds
 * through their own rules.
 */

/**
 * Resolve Tactical Health healing.
 *
 * @param {object} options
 * @param {number} options.currentHealth
 * @param {number} options.maxHealth
 * @param {number} options.healing
 *
 * @returns {object}
 */
export function resolveTacticalHealing({
  currentHealth = 0,
  maxHealth = 0,
  healing = 0
} = {}) {

  const healthBefore =
    Math.max(
      0,
      Number(currentHealth) || 0
    );

  const healthMaximum =
    Math.max(
      0,
      Number(maxHealth) || 0
    );

  const healingRequested =
    Math.max(
      0,
      Number(healing) || 0
    );

  /* -------------------------------------------- */
  /*  Health After                                */
  /* -------------------------------------------- */

  const healthAfter =
    Math.min(
      healthMaximum,
      healthBefore +
        healingRequested
    );

  /* -------------------------------------------- */
  /*  Actual Healing                              */
  /* -------------------------------------------- */

  const healingApplied =
    Math.max(
      0,
      healthAfter -
        healthBefore
    );

  const healingWasted =
    Math.max(
      0,
      healingRequested -
        healingApplied
    );

  /* -------------------------------------------- */
  /*  Recovery State                              */
  /* -------------------------------------------- */

  /*
   * A character who was at 0 Health and is
   * restored above 0 Health wakes up.
   */
  const regainedConsciousness =
    healthBefore <= 0 &&
    healthAfter > 0;

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    health: {
      before:
        healthBefore,

      healingRequested,

      healingApplied,

      healingWasted,

      after:
        healthAfter,

      max:
        healthMaximum
    },

    regainedConsciousness
  };
}
