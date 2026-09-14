/**
 * Tactical
 * Vehicle Data Model
 *
 * Vehicles and autonomous units use Hull instead of Health.
 *
 * Vehicle Modules modify effective Vehicle statistics without
 * permanently altering the Vehicle's stored base statistics.
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

  /* -------------------------------------------- */
  /*  Vehicle Module Modifiers                    */
  /* -------------------------------------------- */

  /**
   * Total modifiers supplied by embedded Vehicle Modules.
   *
   * These values are derived at runtime and are never
   * written into the Vehicle's persisted base statistics.
   */
  get moduleModifiers() {

    const modifiers = {
      hull: 0,
      armorIntegrity: 0,
      movement: 0,
      initiative: 0,
      toughness: 0,
      actions: 0,
      reactions: 0,
      attackPool: 0
    };

    const items =
      this.parent?.items ?? [];

    for (const item of items) {

      if (item.type !== "vehicleModule") {
        continue;
      }

      const system =
        item.system ?? {};

      modifiers.hull +=
        Number(system.hullModifier) || 0;

      modifiers.armorIntegrity +=
        Number(system.armorIntegrityModifier) || 0;

      modifiers.movement +=
        Number(system.movementModifier) || 0;

      modifiers.initiative +=
        Number(system.initiativeModifier) || 0;

      modifiers.toughness +=
        Number(system.toughnessModifier) || 0;

      modifiers.actions +=
        Number(system.actionsModifier) || 0;

      modifiers.reactions +=
        Number(system.reactionsModifier) || 0;

      modifiers.attackPool +=
        Number(system.attackPoolModifier) || 0;
    }

    return modifiers;
  }

  /* -------------------------------------------- */
  /*  Effective Vehicle Statistics               */
  /* -------------------------------------------- */

  /**
   * Effective Vehicle statistics after all embedded
   * Vehicle Module modifiers have been applied.
   */
  get effective() {

    const modifiers =
      this.moduleModifiers;

    const hullMax =
      Math.max(
        0,
        this.hull.max +
          modifiers.hull
      );

    const armorIntegrityMax =
      Math.max(
        0,
        this.armorIntegrity.max +
          modifiers.armorIntegrity
      );

    return {
      hull: {
        value:
          Math.min(
            this.hull.value,
            hullMax
          ),

        max:
          hullMax
      },

      armorIntegrity: {
        value:
          Math.min(
            this.armorIntegrity.value,
            armorIntegrityMax
          ),

        max:
          armorIntegrityMax
      },

      movement:
        Math.max(
          0,
          this.movement +
            modifiers.movement
        ),

      initiative:
        Math.max(
          0,
          this.initiative +
            modifiers.initiative
        ),

      resolve:
        this.resolve,

      toughness:
        Math.max(
          0,
          this.toughness +
            modifiers.toughness
        ),

      actions:
        Math.max(
          0,
          this.actions +
            modifiers.actions
        ),

      reactionsPerRound:
        Math.max(
          0,
          this.reactionsPerRound +
            modifiers.reactions
        ),

      attackPool:
        Math.max(
          0,
          this.attackPool +
            modifiers.attackPool
        )
    };
  }

  /* -------------------------------------------- */
  /*  Derived Data                               */
  /* -------------------------------------------- */

  prepareDerivedData() {
    super.prepareDerivedData();

    const effective =
      this.effective;

    /*
     * Current Hull and Armor Integrity may legitimately
     * exceed their stored base maximum while a module is
     * installed. Clamp them against the effective maximum,
     * not the unmodified base maximum.
     */

    this.hull.value =
      Math.min(
        this.hull.value,
        effective.hull.max
      );

    this.armorIntegrity.value =
      Math.min(
        this.armorIntegrity.value,
        effective.armorIntegrity.max
      );
  }
}
