/**
 * Tactical
 * Ability Data Model
 *
 * Defines generic character, enemy, vehicle,
 * archetype, ancestry, and equipment abilities.
 */

const {
  BooleanField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Ability Item data.
 */
export class TacticalAbilityData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      abilityType: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      sourceModule: new StringField({
        required: false,
        blank: true,
        initial: "tactical"
      }),

      /* -------------------------------------------- */
      /*  Action Economy                              */
      /* -------------------------------------------- */

      actionCost: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      isReaction: new BooleanField({
        required: true,
        initial: false
      }),

      /* -------------------------------------------- */
      /*  Usage Limits                                */
      /* -------------------------------------------- */

      usesPerEncounter: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      usesPerRound: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      cooldownTurns: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Range                                       */
      /* -------------------------------------------- */

      range: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Requirements                                */
      /* -------------------------------------------- */

      minimumRank: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      requiredArchetype: new StringField({
        required: false,
        blank: true,
        initial: ""
      })
    };
  }
}
