/**
 * Tactical
 * Armor Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical
 * Armor Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Armor Sheet Tabs                           */
/* -------------------------------------------- */

const ARMOR_SHEET_TABS = [
  {
    id: "protection",
    label: "Protection"
  },
  {
    id: "logistics",
    label: "Logistics"
  },
  {
    id: "traits",
    label: "Traits"
  },
  {
    id: "restrictions",
    label: "Restrictions & Source"
  }
];

const ARMOR_SHEET_TAB_IDS =
  new Set(
    ARMOR_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Armor Sheet
 */
export class TacticalArmorSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item",
      "armor-sheet"
    ],

    position: {
      width: 620,
      height: 640
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Armor"
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
        "systems/tactical/templates/item/armor-sheet.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Context                                    */
  /* -------------------------------------------- */

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);

    const item =
      this.item;

    const system =
      item.system;

    /* -------------------------------------------- */
    /*  Tab State                                   */
    /* -------------------------------------------- */

    const activeTab =
      ARMOR_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "protection";

    const tabs =
      ARMOR_SHEET_TABS.map(
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

      item,
      system,

      editable:
        this.isEditable,

      activeTab,

      tabs,

      classification: {
        slot:
          system.slot ?? "armor",

        armorType:
          system.armorType ?? "body",

        technologyType:
          system.technologyType ?? ""
      },

      protection: {
        toughness:
          Math.max(
            0,
            Number(system.toughness) || 0
          ),

        integrityMax:
          Math.max(
            0,
            Number(system.integrityMax) || 0
          )
      },

      logistics: {
        supplyValue:
          Math.max(
            0,
            Number(system.supplyValue) || 0
          )
      },

      restrictions: {
        restricted:
          Boolean(system.restricted),

        sourceModule:
          system.sourceModule ?? "tactical"
      },

      traits:
        Array.isArray(system.traits)
          ? system.traits
          : []
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
      !ARMOR_SHEET_TAB_IDS.has(
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
