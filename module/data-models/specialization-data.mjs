/**
 * Tactical
 * Specialization Data Model
 *
 * Defines Specializations tied to Skills.
 */

const {
  BooleanField,
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
        required: true,
        blank: false,
        initial: ""
      }),

      /* -------------------------------------------- */
      /*  Behavior                                    */
      /* -------------------------------------------- */

      grantsDie: new BooleanField({
        required: true,
        initial: true
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
