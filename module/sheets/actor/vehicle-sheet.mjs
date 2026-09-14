/**
 * Tactical
 * Vehicle Actor Sheet
 *
 * Foundry VTT v14 Actor sheet for Tactical
 * Vehicle and autonomous-unit Actors.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Vehicle Sheet Tabs                          */
/* -------------------------------------------- */

const VEHICLE_SHEET_TABS = [
  {
    id: "combat",
    label: "Combat"
  },
  {
    id: "actions",
    label: "Action Economy"
  },
  {
    id: "attack",
    label: "Attack"
  },
  {
    id: "modules",
    label: "Modules"
  }
];

const VEHICLE_SHEET_TAB_IDS =
  new Set(
    VEHICLE_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Vehicle Sheet
 */
export class TacticalVehicleSheet
  extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "actor",
      "vehicle-sheet"
    ],

    position: {
      width: 680,
      height: 700
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Vehicle"
    },

    actions: {
      switchTab:
        this.#onSwitchTab
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                           */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/actor/vehicle-sheet.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Context                                    */
  /* -------------------------------------------- */

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);

    const actor =
      this.actor;

    const system =
      actor.system;

    /* -------------------------------------------- */
    /*  Tab State                                   */
    /* -------------------------------------------- */

    const activeTab =
      VEHICLE_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "combat";

    const tabs =
      VEHICLE_SHEET_TABS.map(
        tab => ({
          ...tab,

          active:
            tab.id === activeTab
        })
      );

    /* -------------------------------------------- */
    /*  Effective Vehicle Statistics               */
    /* -------------------------------------------- */

    const effectiveSystem =
      system.effective ?? {};

    const moduleModifierSystem =
      system.moduleModifiers ?? {};

    const effective = {
      hull: {
        value:
          Math.max(
            0,
            Number(
              effectiveSystem.hull?.value
            ) || 0
          ),

        max:
          Math.max(
            0,
            Number(
              effectiveSystem.hull?.max
            ) || 0
          )
      },

      armorIntegrity: {
        value:
          Math.max(
            0,
            Number(
              effectiveSystem.armorIntegrity?.value
            ) || 0
          ),

        max:
          Math.max(
            0,
            Number(
              effectiveSystem.armorIntegrity?.max
            ) || 0
          )
      },

      movement:
        Math.max(
          0,
          Number(
            effectiveSystem.movement
          ) || 0
        ),

      initiative:
        Math.max(
          0,
          Number(
            effectiveSystem.initiative
          ) || 0
        ),

      resolve:
        Math.max(
          0,
          Number(
            effectiveSystem.resolve
          ) || 0
        ),

      toughness:
        Math.max(
          0,
          Number(
            effectiveSystem.toughness
          ) || 0
        ),

      actions:
        Math.max(
          0,
          Number(
            effectiveSystem.actions
          ) || 0
        ),

      reactionsPerRound:
        Math.max(
          0,
          Number(
            effectiveSystem.reactionsPerRound
          ) || 0
        ),

      attackPool:
        Math.max(
          0,
          Number(
            effectiveSystem.attackPool
          ) || 0
        )
    };

    /* -------------------------------------------- */
    /*  Vehicle Module Totals                      */
    /* -------------------------------------------- */

    const moduleModifiers = {
      hull:
        Number(
          moduleModifierSystem.hull
        ) || 0,

      armorIntegrity:
        Number(
          moduleModifierSystem.armorIntegrity
        ) || 0,

      movement:
        Number(
          moduleModifierSystem.movement
        ) || 0,

      initiative:
        Number(
          moduleModifierSystem.initiative
        ) || 0,

      toughness:
        Number(
          moduleModifierSystem.toughness
        ) || 0,

      actions:
        Number(
          moduleModifierSystem.actions
        ) || 0,

      reactions:
        Number(
          moduleModifierSystem.reactions
        ) || 0,

      attackPool:
        Number(
          moduleModifierSystem.attackPool
        ) || 0
    };

    /* -------------------------------------------- */
    /*  Embedded Vehicle Modules                   */
    /* -------------------------------------------- */

    const vehicleModules =
      actor.items
        .filter(
          item =>
            item.type === "vehicleModule"
        )
        .map(
          item => ({
            id:
              item.id,

            name:
              item.name,

            img:
              item.img,

            moduleType:
              item.system?.moduleType ??
              "utility",

            modifiers: {
              hull:
                Number(
                  item.system?.hullModifier
                ) || 0,

              armorIntegrity:
                Number(
                  item.system?.armorIntegrityModifier
                ) || 0,

              movement:
                Number(
                  item.system?.movementModifier
                ) || 0,

              initiative:
                Number(
                  item.system?.initiativeModifier
                ) || 0,

              toughness:
                Number(
                  item.system?.toughnessModifier
                ) || 0,

              actions:
                Number(
                  item.system?.actionsModifier
                ) || 0,

              reactions:
                Number(
                  item.system?.reactionsModifier
                ) || 0,

              attackPool:
                Number(
                  item.system?.attackPoolModifier
                ) || 0
            }
          })
        );

    /* -------------------------------------------- */
    /*  Sheet Context                               */
    /* -------------------------------------------- */

    return {
      ...context,

      actor,
      system,

      editable:
        this.isEditable,

      activeTab,

      tabs,

      progression: {
        tier:
          Math.max(
            1,
            Number(system.tier) || 1
          ),

        rank:
          Math.max(
            0,
            Number(system.rank) || 0
          ),

        autonomous:
          Boolean(system.autonomous)
      },

      /*
       * Stored base statistics.
       *
       * These remain separate from effective values so
       * module bonuses are never written back into the
       * Vehicle's persistent base statistics.
       */
      combat: {
        hull: {
          value:
            Math.max(
              0,
              Number(system.hull?.value) || 0
            ),

          max:
            Math.max(
              0,
              Number(system.hull?.max) || 0
            )
        },

        armorIntegrity: {
          value:
            Math.max(
              0,
              Number(system.armorIntegrity?.value) || 0
            ),

          max:
            Math.max(
              0,
              Number(system.armorIntegrity?.max) || 0
            )
        },

        movement:
          Math.max(
            0,
            Number(system.movement) || 0
          ),

        initiative:
          Math.max(
            0,
            Number(system.initiative) || 0
          ),

        resolve:
          Math.max(
            0,
            Number(system.resolve) || 0
          ),

        toughness:
          Math.max(
            0,
            Number(system.toughness) || 0
          )
      },

      actionEconomy: {
        actions:
          Math.max(
            0,
            Number(system.actions) || 0
          ),

        reactionsPerRound:
          Math.max(
            0,
            Number(system.reactionsPerRound) || 0
          )
      },

      attack: {
        attackPool:
          Math.max(
            0,
            Number(system.attackPool) || 0
          )
      },

      effective,

      moduleModifiers,

      vehicleModules,

      hasVehicleModules:
        vehicleModules.length > 0
    };
  }

  /* -------------------------------------------- */
  /*  Tab Switching                              */
  /* -------------------------------------------- */

  static async #onSwitchTab(
    event,
    target
  ) {

    const tabId =
      target.dataset.tab;

    if (
      !tabId ||
      !VEHICLE_SHEET_TAB_IDS.has(
        tabId
      )
    ) {
      return;
    }

    if (
      this._activeTab === tabId
    ) {
      return;
    }

    this._activeTab =
      tabId;

    await this.render({
      force: true
    });
  }
}
