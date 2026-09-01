/**
 * Tactical
 * Target Number Modifiers
 *
 * Central helper functions for modifying Tactical roll TNs.
 */

/**
 * Core Tactical TN.
 */
export const BASE_TN = 7;

/**
 * Universal range-band TN modifiers.
 */
export const RANGE_TN_MODIFIERS = {
  melee: -1,
  short: 0,
  medium: 1,
  long: 2,
  extreme: 3
};

/**
 * Cover TN modifiers.
 */
export const COVER_TN_MODIFIERS = {
  none: 0,
  light: 1,
  heavy: 2
};

/**
 * Elevation TN modifiers.
 *
 * Higher attacker = easier shot.
 * Lower attacker = harder shot.
 */
export const ELEVATION_TN_MODIFIERS = {
  lower: 1,
  same: 0,
  higher: -1
};

/**
 * Build a final Tactical Target Number.
 *
 * @param {object} options
 * @param {number} options.baseTN
 * @param {string} options.cover
 * @param {boolean} options.flanking
 * @param {string} options.elevation
 * @param {string} options.range
 * @param {number|null} options.rangeOverride
 * @param {number} options.modifier
 *
 * @returns {object}
 */
export function buildTacticalTN({
  baseTN = BASE_TN,
  cover = "none",
  flanking = false,
  elevation = "same",
  range = "short",
  rangeOverride = null,
  modifier = 0
} = {}) {

  const startingTN = Number(baseTN) || BASE_TN;

  const coverModifier =
    COVER_TN_MODIFIERS[cover] ?? 0;

  const flankingModifier =
    flanking ? -1 : 0;

  const elevationModifier =
    ELEVATION_TN_MODIFIERS[elevation] ?? 0;

  const rangeModifier =
    rangeOverride !== null
      ? Number(rangeOverride) || 0
      : RANGE_TN_MODIFIERS[range] ?? 0;

  const otherModifier =
    Number(modifier) || 0;

  const totalModifier =
    coverModifier +
    flankingModifier +
    elevationModifier +
    rangeModifier +
    otherModifier;

  /*
   * Tactical uses d12s, so TN is clamped
   * between 2 and 12.
   *
   * The Zero-Pool Rule can still explicitly
   * force TN 12 in the roller.
   */
  const finalTN = Math.min(
    12,
    Math.max(2, startingTN + totalModifier)
  );

  return {
    baseTN: startingTN,
    finalTN,
    totalModifier,

    modifiers: {
      cover: coverModifier,
      flanking: flankingModifier,
      elevation: elevationModifier,
      range: rangeModifier,
      other: otherModifier
    }
  };
}
