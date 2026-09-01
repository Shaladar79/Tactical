/**
 * Tactical
 * Advancement Purchase Helper
 *
 * Applies validated Attribute and Skill advancements
 * to Tactical character Actors.
 */

import {
  validateAttributeAdvancement,
  validateSkillAdvancement
} from "./advancement-validator.mjs";

/**
 * Purchase one Attribute increase.
 *
 * @param {Actor} actor
 * @param {string} attributeId
 *
 * @returns {Promise<object>}
 */
export async function purchaseAttributeAdvancement(
  actor,
  attributeId
) {

  if (!actor) {
    throw new Error(
      "Tactical | Attribute advancement requires an Actor."
    );
  }

  if (actor.type !== "character") {
    throw new Error(
      "Tactical | Attribute advancement is only valid for character Actors."
    );
  }

  const currentScore =
    Number(actor.system.attributes?.[attributeId]) || 0;

  const validation =
    validateAttributeAdvancement({
      currentScore,
      rank: actor.system.rank,
      xpEarned: actor.system.xp.earned,
      xpSpent: actor.system.xp.spent
    });

  if (!validation.valid) {
    return {
      success: false,
      validation
    };
  }

  const newSpentXP =
    actor.system.xp.spent +
    validation.cost;

  await actor.update({
    [`system.attributes.${attributeId}`]:
      validation.nextScore,

    "system.xp.spent":
      newSpentXP
  });

  return {
    success: true,
    type: "attribute",
    id: attributeId,

    previousScore:
      validation.currentScore,

    newScore:
      validation.nextScore,

    xpSpent:
      validation.cost,

    totalXPSpent:
      newSpentXP,

    validation
  };
}

/**
 * Purchase one Skill increase.
 *
 * @param {Actor} actor
 * @param {string} skillId
 *
 * @returns {Promise<object>}
 */
export async function purchaseSkillAdvancement(
  actor,
  skillId
) {

  if (!actor) {
    throw new Error(
      "Tactical | Skill advancement requires an Actor."
    );
  }

  if (actor.type !== "character") {
    throw new Error(
      "Tactical | Skill advancement is only valid for character Actors."
    );
  }

  const currentScore =
    Number(actor.system.skills?.[skillId]) || 0;

  const validation =
    validateSkillAdvancement({
      currentScore,
      rank: actor.system.rank,
      xpEarned: actor.system.xp.earned,
      xpSpent: actor.system.xp.spent
    });

  if (!validation.valid) {
    return {
      success: false,
      validation
    };
  }

  const newSpentXP =
    actor.system.xp.spent +
    validation.cost;

  await actor.update({
    [`system.skills.${skillId}`]:
      validation.nextScore,

    "system.xp.spent":
      newSpentXP
  });

  return {
    success: true,
    type: "skill",
    id: skillId,

    previousScore:
      validation.currentScore,

    newScore:
      validation.nextScore,

    xpSpent:
      validation.cost,

    totalXPSpent:
      newSpentXP,

    validation
  };
}
