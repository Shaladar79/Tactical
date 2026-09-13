/**
 * Tactical
 * Unified Enemy Data Model
 *
 * Provides one shared Actor data model for Tactical enemies.
 *
 * Enemy Class determines which class-specific rules and
 * sheet fields are used:
 *
 * Trooper
 * Lieutenant
 * Commander
 * Overlord
 */

const {
  NumberField,
  SchemaField,
  StringField
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
 * Unified Tactical Enemy data.
 */
export class TacticalEnemyData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Enemy Classification                        */
      /* -------------------------------------------- */

      enemyClass: new StringField({
        required: true,
        blank: false,
        initial: "trooper",
        choices: [
          "trooper",
          "lieutenant",
          "commander",
          "overlord"
        ]
      }),

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

      /*
       * Wounds are used differently by Enemy Class:
       *
       * Trooper:
       *   No Wounds.
       *
       * Lieutenant / Commander:
       *   Character-style Wound progression.
       *
       * Overlord:
       *   Maximum Wounds are manually assigned.
       *
       * Max defaults to 4 so a newly-created Enemy
       * converted to Overlord has a usable manual
       * starting value. Trooper derived data suppresses
       * Wounds while that class is selected.
       */
      wounds: resourceField({
        value: 0,
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
      }),

      /* -------------------------------------------- */
      /*  Boss Combat Limits                          */
      /* -------------------------------------------- */

      /*
       * Currently used by Overlords.
       *
       * It remains in the shared schema so the Enemy
       * sheet can expose it only when Overlord is
       * selected.
       */
      reactionsPerRound: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 1
      })
    };
  }

  /**
   * Prepare derived Enemy data.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    /* -------------------------------------------- */
    /*  Enemy-Class Wound Rules                     */
    /* -------------------------------------------- */

    switch (this.enemyClass) {

      /*
       * Troopers do not use Wounds.
       */
      case "trooper":
        this.wounds.value = 0;
        this.wounds.max = 0;
        break;

      /*
       * Lieutenants and Commanders use the same
       * Wound progression as player characters:
       *
       * R0 = 2
       * R1 = 3
       * R2 = 3
       * R3 = 4
       * R4 = 4
       * etc.
       */
      case "lieutenant":
      case "commander":
        this.wounds.max =
          2 + Math.ceil(
            this.rank / 2
          );
        break;

      /*
       * Overlords retain manually assigned
       * Maximum Wounds.
       */
      case "overlord":
        break;
    }

    /* -------------------------------------------- */
    /*  Resource Clamping                           */
    /* -------------------------------------------- */

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
