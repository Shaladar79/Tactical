/**
 * Tactical
 * Weapon Data Model
 *
 * Defines the generic weapon structure used by Tactical.
 */

const {
  ArrayField,
  BooleanField,
  NumberField,
  SchemaField,
  StringField
} = foundry.data.fields;

/**
 * Weapon Item data.
 */
export class TacticalWeaponData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Classification                              */
      /* -------------------------------------------- */

      slot: new StringField({
        required: true,
        blank: false,
        initial: "ranged"
      }),

      weaponType: new StringField({
        required: true,
        blank: false,
        initial: "ranged"
      }),

      technologyType: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      /* -------------------------------------------- */
      /*  Damage                                      */
      /* -------------------------------------------- */

      dps: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      }),

      penetration: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Ammunition                                  */
      /* -------------------------------------------- */

      magazineCapacity: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      ammoRemaining: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      usesMagazine: new BooleanField({
        required: true,
        initial: true
      }),

      /* -------------------------------------------- */
      /*  Range                                       */
      /* -------------------------------------------- */

      intendedRange: new StringField({
        required: true,
        blank: false,
        initial: "short"
      }),

      minimumRange: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      maximumRange: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 5
      }),

      /**
       * Optional TN overrides by range band.
       *
       * A null value means:
       * use the normal Tactical range modifier.
       *
       * Example Sniper profile:
       *
       * short:   +1
       * medium:  +1
       * long:     0
       * extreme: +1
       */
      rangeOverrides: new SchemaField({

        melee: new NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        }),

        short: new NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        }),

        medium: new NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        }),

        long: new NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        }),

        extreme: new NumberField({
          required: false,
          nullable: true,
          integer: true,
          initial: null
        })
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
      /*  Restrictions                                */
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

    /*
     * Weapons cannot hold more ammunition than
     * their Magazine Capacity.
     */
    if (this.usesMagazine) {
      this.ammoRemaining = Math.min(
        this.ammoRemaining,
        this.magazineCapacity
      );
    }
  }
}
