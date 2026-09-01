/**
 * Tactical
 * Utility Data Model
 *
 * Defines reusable tactical equipment carried in Utility slots.
 */

const {
  ArrayField,
  BooleanField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Utility Item data.
 */
export class TacticalUtilityData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      slot: new StringField({
        required: true,
        blank: false,
        initial: "utility"
      }),

      utilityType: new StringField({
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
      /*  Uses / Charges                               */
      /* -------------------------------------------- */

      usesCharges: new BooleanField({
        required: true,
        initial: false
      }),

      charges: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      maxCharges: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Action Information                          */
      /* -------------------------------------------- */

      actionCost: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
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

  prepareDerivedData() {
    super.prepareDerivedData();

    if (this.usesCharges) {
      this.charges = Math.min(
        this.charges,
        this.maxCharges
      );
    }
  }
}
