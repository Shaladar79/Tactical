/**
 * Tactical
 * Apply Session XP
 *
 * Applies a Session XP award to Tactical character Actors.
 */

/**
 * Apply XP to one or more Tactical characters.
 *
 * @param {Array<Actor>} actors
 * Characters receiving the award.
 *
 * @param {number} xpAmount
 * XP awarded to each character.
 *
 * @returns {Promise<object>}
 */
export async function applySessionXP(
  actors = [],
  xpAmount = 0
) {

  const amount = Math.max(
    0,
    Math.floor(Number(xpAmount) || 0)
  );

  const validActors = actors.filter(
    actor =>
      actor &&
      actor.type === "character"
  );

  if (validActors.length === 0) {
    return {
      success: false,
      xpAwarded: amount,
      updated: [],
      skipped: actors.length
    };
  }

  const updated = [];

  for (const actor of validActors) {

    const currentEarnedXP = Math.max(
      0,
      Number(actor.system.xp?.earned) || 0
    );

    const newEarnedXP =
      currentEarnedXP + amount;

    await actor.update({
      "system.xp.earned": newEarnedXP
    });

    updated.push({
      actorId: actor.id,
      actorName: actor.name,
      previousXP: currentEarnedXP,
      awardedXP: amount,
      newXP: newEarnedXP
    });
  }

  return {
    success: true,
    xpAwarded: amount,
    updated,
    skipped:
      actors.length - validActors.length
  };
}
