/**
 * Tactical
 * Ancestry Data Model
 *
 * Defines ancestry options used by Tactical characters.
 * Specific ancestries are supplied by the base game or genre modules.
 */

const {
  ArrayField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Ancestry Item data.
 */
export class TacticalAncestryData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      ancestryType: new StringField({
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
      /*  Attribute Modifiers                         */
      /* -------------------------------------------- */

      mightModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      aimModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      agilityModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      enduranceModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      focusModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      resolveModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      perceptionModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Other Modifiers                             */
      /* -------------------------------------------- */

      movementModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      healthModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      woundModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Granted Features                            */
      /* -------------------------------------------- */

      traits: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      grantedAbilities: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      )
    };
  }
}
