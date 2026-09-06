/**
 * Tactical
 * Damage Resolver
 *
 * Resolves standard Tactical weapon damage.
 */

/**
 * Resolve Tactical damage.
 *
 * @param {object} options
 * @param {number} options.successes
 * Number of attack successes.
 *
 * @param {number} options.dps
 * Damage dealt per success.
 *
 * @param {number} options.damageMultiplier
 * Multiplier applied to Raw Damage before defenses.
 * Defaults to 1.
 *
 * @param {number} options.penetration
 * Amount of Toughness ignored by this attack.
 *
 * @param {number} options.toughness
 * Target's current Toughness.
 *
 * @param {number} options.integrity
 * Target's current Armor Integrity.
 *
 * @param {number} options.health
 * Target's current Health or Hull.
 *
 * @returns {object}
 */
export function resolveTacticalDamage({
  successes = 0,
  dps = 0,
  damageMultiplier = 1,
  penetration = 0,
  toughness = 0,
  integrity = 0,
  health = 0
} = {}) {

  const attackSuccesses = Math.max(
    0,
    Number(successes) || 0
  );

  const damagePerSuccess = Math.max(
    0,
    Number(dps) || 0
  );

  const appliedDamageMultiplier = Math.max(
    0,
    Number(damageMultiplier) || 0
  );

  const attackPenetration = Math.max(
    0,
    Number(penetration) || 0
  );

  const targetToughness = Math.max(
    0,
    Number(toughness) || 0
  );

  const currentIntegrity = Math.max(
    0,
    Number(integrity) || 0
  );

  const currentHealth = Math.max(
    0,
    Number(health) || 0
  );

  /* -------------------------------------------- */
  /*  Raw Damage                                  */
  /* -------------------------------------------- */

  const baseRawDamage =
    attackSuccesses * damagePerSuccess;

  let rawDamage = Math.floor(
    baseRawDamage *
    appliedDamageMultiplier
  );

  /*
   * If a positive multiplier reduces positive
   * Raw Damage below 1, the attack still deals
   * at least 1 Raw Damage.
   */
  if (
    baseRawDamage > 0 &&
    appliedDamageMultiplier > 0
  ) {

    rawDamage = Math.max(
      1,
      rawDamage
    );
  }

  /* -------------------------------------------- */
  /*  Toughness                                   */
  /* -------------------------------------------- */

  const effectiveToughness = Math.max(
    0,
    targetToughness - attackPenetration
  );

  const damageAfterToughness = Math.max(
    0,
    rawDamage - effectiveToughness
  );

  const toughnessPrevented = Math.min(
    rawDamage,
    effectiveToughness
  );

  /* -------------------------------------------- */
  /*  Armor Integrity                             */
  /* -------------------------------------------- */

  const integrityDamage = Math.min(
    currentIntegrity,
    damageAfterToughness
  );

  const remainingIntegrity =
    currentIntegrity - integrityDamage;

  /* -------------------------------------------- */
  /*  Health / Hull                               */
  /* -------------------------------------------- */

  const healthDamage = Math.max(
    0,
    damageAfterToughness - integrityDamage
  );

  const remainingHealth = Math.max(
    0,
    currentHealth - healthDamage
  );

  /* -------------------------------------------- */
  /*  Result                                      */
  /* -------------------------------------------- */

  return {
    successes: attackSuccesses,

    baseRawDamage,
    rawDamage,
    damageMultiplier:
      appliedDamageMultiplier,

    dps: damagePerSuccess,
    penetration: attackPenetration,

    toughness: {
      original: targetToughness,
      effective: effectiveToughness,
      prevented: toughnessPrevented
    },

    integrity: {
      before: currentIntegrity,
      damage: integrityDamage,
      after: remainingIntegrity
    },

    health: {
      before: currentHealth,
      damage: healthDamage,
      after: remainingHealth
    },

    totalDamageApplied:
      integrityDamage + healthDamage
  };
}
