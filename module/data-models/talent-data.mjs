/**
 * Tactical
 * Talent Data Model
 *
 * Defines purchasable character Talents.
 */

const {
  ArrayField,
  BooleanField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Talent Item data.
 */
export class TacticalTalentData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Progression                                 */
      /* -------------------------------------------- */

      minimumRank: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      xpCost: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Repeatability                               */
      /* -------------------------------------------- */

      repeatable: new BooleanField({
        required: true,
        initial: false
      }),

      maxPurchases: new NumberField({
        required: true,
        integer: true,
        min: 1,
        initial: 1
      }),

      /* -------------------------------------------- */
      /*  Rank Gates                                  */
      /* -------------------------------------------- */

      rankGates: new ArrayField(
        new NumberField({
          required: true,
          integer: true,
          min: 0
        })
      ),

      /* -------------------------------------------- */
      /*  Requirements                                */
      /* -------------------------------------------- */

      requiredArchetypes: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      prerequisites: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      /* -------------------------------------------- */
      /*  Classification / Source                     */
      /* -------------------------------------------- */

      talentType: new StringField({
        required: false,
        blank: true,
        initial: "universal"
      }),

      sourceModule: new StringField({
        required: false,
        blank: true,
        initial: "tactical"
      })
    };
  }
}
