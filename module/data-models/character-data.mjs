/**
 * Tactical
 * Character Data Model
 *
 * Defines the genre-neutral data used by player characters.
 */

import {
  getRankFromXPSpent,
  getMaxWoundsForRank,
  getMaxRankDice
} from "../progression/rank-progression.mjs";

const {
  NumberField,
  SchemaField,
  StringField,
  TypedObjectField
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

      /**
       * Rank is stored on the Actor for convenience,
       * but is recalculated from XP Spent whenever
       * derived data is prepared.
       */
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
      /*  Skills                                      */
      /* -------------------------------------------- */

      /**
       * Skills are stored dynamically by Skill ID.
       *
       * Example:
       *
       * skills: {
       *   athletics: 1,
       *   ranged: 2,
       *   medicine: 0,
       *   technology: 1
       * }
       *
       * Future modules may register additional Skill IDs without
       * requiring changes to this Character Data Model.
       */
      skills: new TypedObjectField(
        new NumberField({
          required: true,
          integer: true,
          min: 0,
          initial: 0
        }),
        {
          required: true,
          initial: {}
        }
      ),

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
   * Calculate values derived from XP, Rank, and Attributes.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    /* -------------------------------------------- */
    /*  Rank                                        */
    /* -------------------------------------------- */

    this.rank = getRankFromXPSpent(
      this.xp.spent
    );

    const rank = this.rank;
    const endurance = this.attributes.endurance;
    const agility = this.attributes.agility;

    /* -------------------------------------------- */
    /*  Health                                      */
    /* -------------------------------------------- */

    /**
     * Health =
     * 5 + (Endurance × (Rank + 1))
     */
    this.health.max =
      5 + (endurance * (rank + 1));

    /* -------------------------------------------- */
    /*  Movement                                    */
    /* -------------------------------------------- */

    /**
     * Movement = 3 + Agility
     */
    this.movement =
      3 + agility;

    /* -------------------------------------------- */
    /*  Wounds                                      */
    /* -------------------------------------------- */

    this.wounds.max =
      getMaxWoundsForRank(rank);

    /* -------------------------------------------- */
    /*  Rank Dice                                   */
    /* -------------------------------------------- */

    this.rankDice.max =
      getMaxRankDice(rank);

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
