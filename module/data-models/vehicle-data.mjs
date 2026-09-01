/**
 * Tactical
 * Vehicle Data Model
 *
 * Vehicles and autonomous units use Hull instead of Health.
 */

const {
  BooleanField,
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
 * Vehicle data.
 */
export class TacticalVehicleData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Progression / Classification                */
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

      autonomous: new BooleanField({
        required: true,
        initial: false
      }),

      /* -------------------------------------------- */
      /*  Core Combat Statistics                      */
      /* -------------------------------------------- */

      hull: resourceField({
        value: 5,
        max: 5
      }),

      armorIntegrity: resourceField({
        value: 0,
        max: 0
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

      actions: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 2
      }),

      reactionsPerRound: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      }),

      /* -------------------------------------------- */
      /*  Attack Defaults                             */
      /* -------------------------------------------- */

      attackPool: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      })
    };
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.hull.value = Math.min(
      this.hull.value,
      this.hull.max
    );

    this.armorIntegrity.value = Math.min(
      this.armorIntegrity.value,
      this.armorIntegrity.max
    );
  }
}
