/**
 * Tactical
 * Utility Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical
 * Utility Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Utility Sheet Tabs                          */
/* -------------------------------------------- */

const UTILITY_SHEET_TABS = [
  {
    id: "charges",
    label: "Charges"
  },
  {
    id: "action",
    label: "Action"
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

const UTILITY_SHEET_TAB_IDS =
  new Set(
    UTILITY_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Utility Sheet
 */
export class TacticalUtilitySheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item",
      "utility-sheet"
    ],

    position: {
      width: 640,
      height: 660
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Utility"
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
        "systems/tactical/templates/item/utility-sheet.hbs"
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
      UTILITY_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "charges";

    const tabs =
      UTILITY_SHEET_TABS.map(
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
          system.slot ?? "utility",

        utilityType:
          system.utilityType ?? "",

        technologyType:
          system.technologyType ?? ""
      },

      charges: {
        usesCharges:
          Boolean(system.usesCharges),

        charges:
          Math.max(
            0,
            Number(system.charges) || 0
          ),

        maxCharges:
          Math.max(
            0,
            Number(system.maxCharges) || 0
          )
      },

      action: {
        actionCost:
          Math.max(
            0,
            Number(system.actionCost) || 0
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
      !UTILITY_SHEET_TAB_IDS.has(
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
