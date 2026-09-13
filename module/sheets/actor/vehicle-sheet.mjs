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
/*  Vehicle Sheet Tabs                         */
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
      }
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
