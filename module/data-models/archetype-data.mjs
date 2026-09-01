/**
 * Tactical
 * Archetype Data Model
 *
 * Defines generic Archetype options used by Tactical characters.
 * Specific Archetypes are supplied by the base game or genre modules.
 */

const {
  ArrayField,
  NumberField,
  StringField
} = foundry.data.fields;

/**
 * Archetype Item data.
 */
export class TacticalArchetypeData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      archetypeType: new StringField({
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
      /*  Progression Requirement                      */
      /* -------------------------------------------- */

      minimumRank: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Granted Features                            */
      /* -------------------------------------------- */

      grantedSpecializations: new ArrayField(
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
      ),

      grantedTalents: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      /* -------------------------------------------- */
      /*  Equipment Access                            */
      /* -------------------------------------------- */

      equipmentPermissions: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      standardEquipment: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      ),

      /* -------------------------------------------- */
      /*  Traits / Tags                               */
      /* -------------------------------------------- */

      traits: new ArrayField(
        new StringField({
          required: true,
          blank: false
        })
      )
    };
  }
}
