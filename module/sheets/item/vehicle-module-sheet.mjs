/**
 * Tactical
 * Vehicle Module Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical Vehicle Modules.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Vehicle Module Types                        */
/* -------------------------------------------- */

const VEHICLE_MODULE_TYPES = [
  {
    value: "armor",
    label: "Armor"
  },
  {
    value: "engine",
    label: "Engine"
  },
  {
    value: "weapon-system",
    label: "Weapon System"
  },
  {
    value: "electronics",
    label: "Electronics"
  },
  {
    value: "utility",
    label: "Utility"
  },
  {
    value: "crew",
    label: "Crew"
  },
  {
    value: "other",
    label: "Other"
  }
];

/* -------------------------------------------- */
/*  Vehicle Module Sheet Tabs                   */
/* -------------------------------------------- */

const VEHICLE_MODULE_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "modifiers",
    label: "Modifiers"
  },
  {
    id: "classification",
    label: "Classification"
  },
  {
    id: "description",
    label: "Description"
  }
];

const VEHICLE_MODULE_SHEET_TAB_IDS =
  new Set(
    VEHICLE_MODULE_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Vehicle Module Sheet
 */
export class TacticalVehicleModuleSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item-sheet",
      "vehicle-module-sheet"
    ],

    position: {
      width: 640,
      height: 600
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Vehicle Module"
    },

    actions: {
      switchTab: this.#onSwitchTab
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                           */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/item/vehicle-module-sheet.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Context                                    */
  /* -------------------------------------------- */

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);

    const item = this.item;
    const system = item.system;

    const activeTab =
      VEHICLE_MODULE_SHEET_TAB_IDS.has(this._activeTab)
        ? this._activeTab
        : "overview";

    const tabs =
      VEHICLE_MODULE_SHEET_TABS.map(
        tab => ({
          ...tab,
          active:
            tab.id === activeTab
        })
      );

    const moduleType =
      system.moduleType ?? "utility";

    const moduleTypes =
      VEHICLE_MODULE_TYPES.map(
        entry => ({
          ...entry,
          selected:
            entry.value === moduleType
        })
      );

    const modifiers = {
      hull:
        Number(system.hullModifier) || 0,

      armorIntegrity:
        Number(system.armorIntegrityModifier) || 0,

      movement:
        Number(system.movementModifier) || 0,

      initiative:
        Number(system.initiativeModifier) || 0,

      toughness:
        Number(system.toughnessModifier) || 0,

      actions:
        Number(system.actionsModifier) || 0,

      reactions:
        Number(system.reactionsModifier) || 0,

      attackPool:
        Number(system.attackPoolModifier) || 0
    };

    return {
      ...context,

      item,
      system,

      editable:
        this.isEditable,

      activeTab,

      tabs,

      moduleTypes,

      classification: {
        moduleType,

        sourceModule:
          system.sourceModule ?? "tactical"
      },

      modifiers,

      description:
        system.description ?? ""
    };
  }

  /* -------------------------------------------- */
  /*  Actions                                    */
  /* -------------------------------------------- */

  static #onSwitchTab(event, target) {

    const tab =
      target.dataset.tab;

    if (!VEHICLE_MODULE_SHEET_TAB_IDS.has(tab)) {
      return;
    }

    this._activeTab = tab;

    this.render();
  }
}
