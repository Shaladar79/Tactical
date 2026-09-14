/**
 * Tactical
 * Specialization Data Model
 *
 * Defines Specializations tied to Skills.
 */

const {
  StringField
} = foundry.data.fields;

/**
 * Specialization Item data.
 */
export class TacticalSpecializationData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Parent Skill                                */
      /* -------------------------------------------- */

      parentSkill: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      /* -------------------------------------------- */
      /*  Classification / Source                     */
      /* -------------------------------------------- */

      specializationType: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      sourceModule: new StringField({
        required: false,
        blank: true,
        initial: "tactical"
      })
    };
  }
}
