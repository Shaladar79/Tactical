/**
 * Tactical
 * Consumable Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical
 * Consumable Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Consumable Sheet Tabs                      */
/* -------------------------------------------- */

const CONSUMABLE_SHEET_TABS = [
  {
    id: "usage",
    label: "Usage"
  },
  {
    id: "effects",
    label: "Effects"
  },
  {
    id: "save",
    label: "Save"
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

const CONSUMABLE_SHEET_TAB_IDS =
  new Set(
    CONSUMABLE_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Consumable Sheet
 */
export class TacticalConsumableSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item",
      "consumable-sheet"
    ],

    position: {
      width: 620,
      height: 720
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Consumable"
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
        "systems/tactical/templates/item/consumable-sheet.hbs"
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
      CONSUMABLE_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "usage";

    const tabs =
      CONSUMABLE_SHEET_TABS.map(
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
          system.slot ?? "consumable",

        consumableType:
          system.consumableType ?? "",

        technologyType:
          system.technologyType ?? ""
      },

      usage: {
        quantity:
          Math.max(
            0,
            Number(system.quantity) || 0
          ),

        consumedOnUse:
          system.consumedOnUse !== false,

        actionCost:
          Math.max(
            0,
            Number(system.actionCost) || 0
          )
      },

      effects: {
        healing:
          Math.max(
            0,
            Number(system.healing) || 0
          ),

        woundRemoval:
          Math.max(
            0,
            Number(system.woundRemoval) || 0
          ),

        dps:
          Math.max(
            0,
            Number(system.dps) || 0
          ),

        penetration:
          Math.max(
            0,
            Number(system.penetration) || 0
          ),

        blastRadius:
          Math.max(
            0,
            Number(system.blastRadius) || 0
          )
      },

      save: {
        tn:
          Math.max(
            2,
            Math.min(
              12,
              Number(system.saveTN) || 7
            )
          ),

        difficulty:
          Math.max(
            1,
            Math.floor(
              Number(system.saveDifficulty) || 1
            )
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
      !CONSUMABLE_SHEET_TAB_IDS.has(
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
