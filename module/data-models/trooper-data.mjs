/**
 * Tactical
 * Trooper Data Model
 *
 * Troopers are simplified standard enemies.
 * They use Health but do not use Wounds.
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
 * Reusable Tactical Attribute field.
 */
function attributeField() {
  return new NumberField({
    required: true,
    integer: true,
    min: 0,
    initial: 0
  });
}

/**
 * Reusable general Save Bonus field.
 */
function saveBonusField() {
  return new NumberField({
    required: true,
    integer: true,
    min: 0,
    initial: 0
  });
}

/**
 * Trooper-Class enemy data.
 */
export class TacticalTrooperData extends foundry.abstract.TypeDataModel {

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
      /*  Tactical Attributes                         */
      /* -------------------------------------------- */

      attributes: new SchemaField({

        might:
          attributeField(),

        precision:
          attributeField(),

        agility:
          attributeField(),

        endurance:
          attributeField(),

        focus:
          attributeField(),

        resolve:
          attributeField(),

        perception:
          attributeField()
      }),

      /* -------------------------------------------- */
      /*  General Save Bonuses                        */
      /* -------------------------------------------- */

      saveBonuses: new SchemaField({

        might:
          saveBonusField(),

        precision:
          saveBonusField(),

        agility:
          saveBonusField(),

        endurance:
          saveBonusField(),

        focus:
          saveBonusField(),

        resolve:
          saveBonusField(),

        perception:
          saveBonusField()
      }),

      /* -------------------------------------------- */
      /*  Core Combat Statistics                      */
      /* -------------------------------------------- */

      health: resourceField({
        value: 4,
        max: 4
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

      /*
       * Legacy enemy Resolve value.
       *
       * Retained temporarily for compatibility with
       * existing enemy systems that may still read
       * system.resolve directly.
       *
       * New Save logic should use:
       * system.attributes.resolve
       */
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
   * Prepare derived Trooper data.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    /*
     * Current Health cannot exceed Maximum Health.
     */
    this.health.value = Math.min(
      this.health.value,
      this.health.max
    );

    /*
     * Current Armor Integrity cannot exceed
     * Maximum Armor Integrity.
     */
    this.armorIntegrity.value = Math.min(
      this.armorIntegrity.value,
      this.armorIntegrity.max
    );
  }
}
