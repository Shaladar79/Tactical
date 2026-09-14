/**
 * Tactical
 * General Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical General Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  General Item Categories                     */
/* -------------------------------------------- */

const GENERAL_ITEM_CATEGORIES = [
  {
    value: "general",
    label: "General"
  },
  {
    value: "mission",
    label: "Mission"
  },
  {
    value: "campaign",
    label: "Campaign"
  },
  {
    value: "valuable",
    label: "Valuable"
  },
  {
    value: "trade-good",
    label: "Trade Good"
  },
  {
    value: "key-item",
    label: "Key Item"
  },
  {
    value: "salvage",
    label: "Salvage"
  }
];

/* -------------------------------------------- */
/*  General Sheet Tabs                          */
/* -------------------------------------------- */

const GENERAL_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "details",
    label: "Details"
  },
  {
    id: "description",
    label: "Description"
  }
];

const GENERAL_SHEET_TAB_IDS =
  new Set(
    GENERAL_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical General Item Sheet
 */
export class TacticalGeneralSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item-sheet",
      "general-sheet"
    ],

    position: {
      width: 620,
      height: 560
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical General Item"
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
        "systems/tactical/templates/item/general-sheet.hbs"
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
      GENERAL_SHEET_TAB_IDS.has(this._activeTab)
        ? this._activeTab
        : "overview";

    const tabs =
      GENERAL_SHEET_TABS.map(
        tab => ({
          ...tab,
          active:
            tab.id === activeTab
        })
      );

    const category =
      system.category ?? "general";

    const categories =
      GENERAL_ITEM_CATEGORIES.map(
        entry => ({
          ...entry,
          selected:
            entry.value === category
        })
      );

    const quantity =
      Math.max(
        0,
        Number(system.quantity) || 0
      );

    const value =
      Math.max(
        0,
        Number(system.value) || 0
      );

    return {
      ...context,

      item,
      system,

      editable:
        this.isEditable,

      activeTab,

      tabs,

      categories,

      details: {
        category,
        sourceModule:
          system.sourceModule ?? "tactical",

        quantity,

        value,

        totalValue:
          quantity * value
      },

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

    if (!GENERAL_SHEET_TAB_IDS.has(tab)) {
      return;
    }

    this._activeTab = tab;

    this.render();
  }
}
