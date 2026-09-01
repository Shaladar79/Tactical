/**
 * Tactical
 * Commander Data Model
 *
 * Commanders are major mission bosses.
 * They use Health and the same Wound progression
 * as player characters.
 */

const {
  NumberField,
  SchemaField
} = foundry.data.fields;

/**
 * Reusable current / maximum resource field.
 */
function resourceField({ value = 0, max = 0 } = {}) {
  return new SchemaField({
    value: new NumberField({
      required: true,
      integer: true,
      min: 0,
      initial: value
    }),

    max: new NumberField({
      required: true,
      integer: true,
      min: 0,
      initial: max
    })
  });
}

/**
 * Commander-Class enemy data.
 */
export class TacticalCommanderData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Enemy Progression                           */
      /* -------------------------------------------- */

      tier: new NumberField({
        required: true,
        integer: true,
        min: 1,
        initial: 1
      }),

      rank: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      /* -------------------------------------------- */
      /*  Core Combat Statistics                      */
      /* -------------------------------------------- */

      health: resourceField({
        value: 10,
        max: 10
      }),

      wounds: resourceField({
        value: 0,
        max: 2
      }),

      movement: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 3
      }),

      resolve: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      }),

      toughness: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      armorIntegrity: resourceField({
        value: 0,
        max: 0
      }),

      /* -------------------------------------------- */
      /*  Attack Defaults                             */
      /* -------------------------------------------- */

      attackPool: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      })
    };
  }

  /**
   * Prepare derived Commander data.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    /*
     * Commander Maximum Wounds use the same
     * progression as player characters:
     *
     * R0 = 2
     * R1 = 3
     * R2 = 3
     * R3 = 4
     * R4 = 4
     * etc.
     */
    this.wounds.max = 2 + Math.ceil(this.rank / 2);

    /*
     * Clamp current resources.
     */
    this.health.value = Math.min(
      this.health.value,
      this.health.max
    );

    this.wounds.value = Math.min(
      this.wounds.value,
      this.wounds.max
    );

    this.armorIntegrity.value = Math.min(
      this.armorIntegrity.value,
      this.armorIntegrity.max
    );
  }
}
