/**
 * Tactical
 * Talent Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical Talents.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Talent Sheet Tabs                           */
/* -------------------------------------------- */

const TALENT_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "progression",
    label: "Progression"
  },
  {
    id: "requirements",
    label: "Requirements"
  },
  {
    id: "classification",
    label: "Classification"
  }
];

const TALENT_SHEET_TAB_IDS =
  new Set(
    TALENT_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Talent Sheet
 */
export class TacticalTalentSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item-sheet",
      "talent-sheet"
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
      title: "Tactical Talent"
    },

    actions: {
      switchTab: this.#onSwitchTab,

      addRankGate: this.#onAddRankGate,
      removeRankGate: this.#onRemoveRankGate,

      addRequiredArchetype: this.#onAddRequiredArchetype,
      removeRequiredArchetype: this.#onRemoveRequiredArchetype,

      addPrerequisite: this.#onAddPrerequisite,
      removePrerequisite: this.#onRemovePrerequisite
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                           */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/item/talent-sheet.hbs"
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
      TALENT_SHEET_TAB_IDS.has(this._activeTab)
        ? this._activeTab
        : "overview";

    const tabs =
      TALENT_SHEET_TABS.map(
        tab => ({
          ...tab,
          active:
            tab.id === activeTab
        })
      );

    return {
      ...context,

      item,
      system,

      editable:
        this.isEditable,

      activeTab,

      tabs,

      progression: {
        minimumRank:
          Math.max(
            0,
            Number(system.minimumRank) || 0
          ),

        xpCost:
          Math.max(
            0,
            Number(system.xpCost) || 0
          ),

        repeatable:
          system.repeatable === true,

        maxPurchases:
          Math.max(
            1,
            Number(system.maxPurchases) || 1
          ),

        rankGates:
          Array.isArray(system.rankGates)
            ? system.rankGates
            : []
      },

      requirements: {
        requiredArchetypes:
          Array.isArray(system.requiredArchetypes)
            ? system.requiredArchetypes
            : [],

        prerequisites:
          Array.isArray(system.prerequisites)
            ? system.prerequisites
            : []
      },

      classification: {
        talentType:
          system.talentType ?? "universal",

        sourceModule:
          system.sourceModule ?? "tactical"
      }
    };
  }

  /* -------------------------------------------- */
  /*  Array Helpers                              */
  /* -------------------------------------------- */

  async _appendArrayValue(path, value) {

    const current =
      foundry.utils.getProperty(
        this.item.system,
        path
      );

    const next =
      Array.isArray(current)
        ? [...current, value]
        : [value];

    await this.item.update({
      [`system.${path}`]: next
    });
  }

  async _removeArrayValue(path, index) {

    const current =
      foundry.utils.getProperty(
        this.item.system,
        path
      );

    if (!Array.isArray(current)) {
      return;
    }

    const numericIndex =
      Number(index);

    if (
      !Number.isInteger(numericIndex) ||
      numericIndex < 0 ||
      numericIndex >= current.length
    ) {
      return;
    }

    const next =
      current.filter(
        (_value, currentIndex) =>
          currentIndex !== numericIndex
      );

    await this.item.update({
      [`system.${path}`]: next
    });
  }

  /* -------------------------------------------- */
  /*  Actions                                    */
  /* -------------------------------------------- */

  static #onSwitchTab(event, target) {

    const tab =
      target.dataset.tab;

    if (!TALENT_SHEET_TAB_IDS.has(tab)) {
      return;
    }

    this._activeTab = tab;

    this.render();
  }

  static async #onAddRankGate() {

    await this._appendArrayValue(
      "rankGates",
      0
    );
  }

  static async #onRemoveRankGate(event, target) {

    await this._removeArrayValue(
      "rankGates",
      target.dataset.index
    );
  }

  static async #onAddRequiredArchetype() {

    await this._appendArrayValue(
      "requiredArchetypes",
      ""
    );
  }

  static async #onRemoveRequiredArchetype(event, target) {

    await this._removeArrayValue(
      "requiredArchetypes",
      target.dataset.index
    );
  }

  static async #onAddPrerequisite() {

    await this._appendArrayValue(
      "prerequisites",
      ""
    );
  }

  static async #onRemovePrerequisite(event, target) {

    await this._removeArrayValue(
      "prerequisites",
      target.dataset.index
    );
  }
}
