/**
 * Tactical
 * Vehicle Module Data Model
 *
 * Defines installable Vehicle Modules and their
 * additive modifiers to Vehicle statistics.
 */

const {
  HTMLField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Vehicle Module Item data.
 */
export class TacticalVehicleModuleData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      moduleType: new StringField({
        required: false,
        blank: true,
        initial: "utility"
      }),

      sourceModule: new StringField({
        required: false,
        blank: true,
        initial: "tactical"
      }),

      /* -------------------------------------------- */
      /*  Vehicle Stat Modifiers                       */
      /* -------------------------------------------- */

      hullModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      armorIntegrityModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      movementModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      initiativeModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      toughnessModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      actionsModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      reactionsModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      attackPoolModifier: new NumberField({
        required: true,
        integer: true,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Description                                 */
      /* -------------------------------------------- */

      description: new HTMLField({
        required: false,
        blank: true,
        initial: ""
      })
    };
  }
}
