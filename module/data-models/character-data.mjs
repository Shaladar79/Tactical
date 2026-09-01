/**
 * Tactical
 * Character Data Model
 *
 * Defines the genre-neutral data used by player characters.
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
 * Reusable Attribute field.
 *
 * Tactical Attributes begin at 0.
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
 * Player Character data.
 */
export class TacticalCharacterData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /*  Progression                                 */
      /* -------------------------------------------- */

      rank: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      xp: new SchemaField({
        earned: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0
        }),

        spent: new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0
        })
      }),

      /* -------------------------------------------- */
      /*  Attributes                                  */
      /* -------------------------------------------- */

      attributes: new SchemaField({
        might: attributeField(),
        aim: attributeField(),
        agility: attributeField(),
        endurance: attributeField(),
        focus: attributeField(),
        resolve: attributeField(),
        perception: attributeField()
      }),

      /* -------------------------------------------- */
      /*  Derived Resources                           */
      /* -------------------------------------------- */

      health: resourceField({
        value: 5,
        max: 5
      }),

      wounds: resourceField({
        value: 0,
        max: 2
      }),

      armorIntegrity: resourceField({
        value: 0,
        max: 0
      }),

      /* -------------------------------------------- */
      /*  Derived Combat Statistics                   */
      /* -------------------------------------------- */

      movement: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 3
      }),

      toughness: new NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0
      }),

      rankDice: resourceField({
        value: 0,
        max: 0
      }),

      /* -------------------------------------------- */
      /*  Character Options                           */
      /* -------------------------------------------- */

      ancestryId: new StringField({
        required: false,
        blank: true,
        initial: ""
      }),

      archetypeId: new StringField({
        required: false,
        blank: true,
        initial: ""
      })
    };
  }

  /**
   * Calculate values that are derived from Rank and Attributes.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    const rank = this.rank;
    const endurance = this.attributes.endurance;
    const agility = this.attributes.agility;

    /*
     * Health = 5 + (Endurance × (Rank + 1))
     */
    this.health.max = 5 + (endurance * (rank + 1));

    /*
     * Movement = 3 + Agility
     */
    this.movement = 3 + agility;

    /*
     * Maximum Wounds:
     *
     * R0 = 2
     * R1 = 3
     * R2 = 3
     * R3 = 4
     * R4 = 4
     * etc.
     */
    this.wounds.max = 2 + Math.ceil(rank / 2);

    /*
     * Rank Dice:
     *
     * R0 = 0
     * R1 = 1
     * R2 = 2
     * etc.
     */
    this.rankDice.max = rank;

    /*
     * Do not allow current resources to exceed maximum.
     */
    this.health.value = Math.min(
      this.health.value,
      this.health.max
    );

    this.wounds.value = Math.min(
      this.wounds.value,
      this.wounds.max
    );

    this.rankDice.value = Math.min(
      this.rankDice.value,
      this.rankDice.max
    );

    this.armorIntegrity.value = Math.min(
      this.armorIntegrity.value,
      this.armorIntegrity.max
    );
  }
}
