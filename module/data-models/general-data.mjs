/**
 * Tactical
 * General Item Data Model
 *
 * Defines narrative, mission, salvage,
 * valuable, and miscellaneous campaign items.
 */

const {
  HTMLField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * General Item data.
 */
export class TacticalGeneralData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      category: new StringField({
        required: false,
        blank: true,
        initial: "general"
      }),

      sourceModule: new StringField({
        required: false,
        blank: true,
        initial: "tactical"
      }),

      /* -------------------------------------------- */
      /*  Inventory                                   */
      /* -------------------------------------------- */

      quantity: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      }),

      /**
       * Abstract value per individual item.
       *
       * Future campaign systems may interpret this as
       * Supply Points, salvage value, trade value,
       * base resources, or another genre-specific currency.
       */
      value: new NumberField({
        required: true,
        min: 0,
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
