/**
 * Tactical
 * Core d12 Success-Pool Roller
 */

/**
 * Roll a Tactical d12 pool.
 *
 * @param {object} options
 * @param {number} options.pool - Number of d12s to roll.
 * @param {number} options.tn - Target Number.
 * @param {string} options.flavor - Chat flavor text.
 *
 * @returns {Promise<object>}
 */
export async function rollTacticalPool({
  pool = 0,
  tn = 7,
  flavor = "Tactical Roll"
} = {}) {

  let dicePool = Math.max(0, Number(pool) || 0);
  let targetNumber = Math.max(2, Number(tn) || 7);

  let zeroPool = false;

  /**
   * Zero-Pool Rule:
   *
   * If the final pool would be 0d12,
   * roll 1d12 at TN 12.
   */
  if (dicePool <= 0) {
    dicePool = 1;
    targetNumber = 12;
    zeroPool = true;
  }

  const roll = await new Roll(`${dicePool}d12`).evaluate();

  const results = roll.dice.flatMap(die =>
    die.results.map(result => result.result)
  );

  const successes = results.filter(
    result => result >= targetNumber
  ).length;

  const criticalPoints = results.filter(
    result => result === 12
  ).length;

  const resultData = {
    roll,
    pool: dicePool,
    tn: targetNumber,
    successes,
    criticalPoints,
    zeroPool,
    results
  };

  await roll.toMessage({
    flavor:
      `${flavor}<br>` +
      `TN ${targetNumber} | ` +
      `${successes} Success${successes === 1 ? "" : "es"} | ` +
      `${criticalPoints} Critical Point${criticalPoints === 1 ? "" : "s"}` +
      `${zeroPool ? "<br>Zero-Pool Rule Applied" : ""}`
  });

  return resultData;
}
