/**
 * Tactical
 * Lieutenant Data Model
 *
 * Lieutenants are elite enemies and mini-bosses.
 * They use Health and Wounds.
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
 * Lieutenant-Class enemy data.
 */
export class TacticalLieutenantData extends foundry.abstract.TypeDataModel {

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
        min: 1,
        initial: 1
      }),

      /* -------------------------------------------- */
      /*  Core Combat Statistics                      */
      /* -------------------------------------------- */

      health: resourceField({
        value: 8,
        max: 8
      }),

      wounds: resourceField({
        value: 0,
        max: 1
      }),

      movement: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 3
      }),

      initiative: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
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
   * Prepare derived Lieutenant data.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    /*
     * Lieutenant Maximum Wounds:
     *
     * 1 Wound per Rank.
     */
    this.wounds.max = Math.max(1, this.rank);

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
