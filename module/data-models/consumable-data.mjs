/**
 * Tactical
 * Consumable Data Model
 *
 * Defines one-use or limited-use equipment carried
 * in Consumable slots.
 */

const {
  ArrayField,
  BooleanField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Consumable Item data.
 */
export class TacticalConsumableData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      slot: new StringField({
        required: true,
        blank: false,
        initial: "consumable"
      }),

      consumableType: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      technologyType: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      /* -------------------------------------------- */
      /*  Usage                                       */
      /* -------------------------------------------- */

      quantity: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      }),

      consumedOnUse: new BooleanField({
        required: true,
        initial: true
      }),

      actionCost: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      }),

      /* -------------------------------------------- */
      /*  Effect Values                               */
      /* -------------------------------------------- */

      healing: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      woundRemoval: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      dps: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      penetration: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      blastRadius: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Logistics                                   */
      /* -------------------------------------------- */

      supplyValue: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Traits                                      */
      /* -------------------------------------------- */

      traits: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      /* -------------------------------------------- */
      /*  Restrictions / Source                       */
      /* -------------------------------------------- */

      restricted: new BooleanField({
        required: true,
        initial: false
      }),

      sourceModule: new StringField({
        required: false,
        blank: true,
        initial: "tactical"
      })
    };
  }
}
