/**
 * Tactical
 * Armor Data Model
 *
 * Defines the generic armor structure used by Tactical.
 */

const {
  ArrayField,
  BooleanField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Armor Item data.
 */
export class TacticalArmorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      slot: new StringField({
        required: true,
        blank: false,
        initial: "armor"
      }),

      armorType: new StringField({
        required: true,
        blank: false,
        initial: "body"
      }),

      technologyType: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      /* -------------------------------------------- */
      /*  Protection                                  */
      /* -------------------------------------------- */

      toughness: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      integrityMax: new NumberField({
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
