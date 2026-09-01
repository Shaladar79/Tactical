/**
 * Tactical
 * Initiative Resolver
 *
 * Initiative = 1d12 + Perception + Agility
 */

/**
 * Roll Tactical initiative.
 *
 * @param {object} options
 * @param {number} options.perception
 * @param {number} options.agility
 * @param {number} options.modifier
 * @param {string} options.flavor
 *
 * @returns {Promise<object>}
 */
export async function rollTacticalInitiative({
  perception = 0,
  agility = 0,
  modifier = 0,
  flavor = "Initiative"
} = {}) {

  const perceptionValue = Math.max(
    0,
    Number(perception) || 0
  );

  const agilityValue = Math.max(
    0,
    Number(agility) || 0
  );

  const otherModifier =
    Number(modifier) || 0;

  const roll = await new Roll("1d12").evaluate();

  const dieResult =
    roll.total ?? 0;

  const total =
    dieResult +
    perceptionValue +
    agilityValue +
    otherModifier;

  await roll.toMessage({
    flavor:
      `${flavor}<br>` +
      `1d12 (${dieResult}) + ` +
      `Perception ${perceptionValue} + ` +
      `Agility ${agilityValue}` +
      `${otherModifier !== 0
        ? ` ${otherModifier >= 0 ? "+" : "-"} ${Math.abs(otherModifier)}`
        : ""
      } = <strong>${total}</strong>`
  });

  return {
    roll,
    dieResult,

    perception: perceptionValue,
    agility: agilityValue,
    modifier: otherModifier,

    total
  };
}
