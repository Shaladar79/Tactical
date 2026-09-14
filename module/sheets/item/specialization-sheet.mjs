/**
 * Tactical
 * Specialization Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical Specializations.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Specialization Sheet Tabs                   */
/* -------------------------------------------- */

const SPECIALIZATION_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "skill",
    label: "Skill"
  },
  {
    id: "classification",
    label: "Classification"
  }
];

const SPECIALIZATION_SHEET_TAB_IDS =
  new Set(
    SPECIALIZATION_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Specialization Sheet
 */
export class TacticalSpecializationSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                         */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item-sheet",
      "specialization-sheet"
    ],

    position: {
      width: 560,
      height: 440
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Specialization"
    },

    actions: {
      switchTab: this.#onSwitchTab
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                            */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/item/specialization-sheet.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Context                                     */
  /* -------------------------------------------- */

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);

    const item = this.item;
    const system = item.system;

    const activeTab =
      SPECIALIZATION_SHEET_TAB_IDS.has(this._activeTab)
        ? this._activeTab
        : "overview";

    const tabs =
      SPECIALIZATION_SHEET_TABS.map(
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

      skill: {
        parentSkill:
          system.parentSkill ?? ""
      },

      classification: {
        specializationType:
          system.specializationType ?? "",

        sourceModule:
          system.sourceModule ?? "tactical"
      }
    };
  }

  /* -------------------------------------------- */
  /*  Actions                                     */
  /* -------------------------------------------- */

  static #onSwitchTab(event, target) {

    const tab =
      target.dataset.tab;

    if (!SPECIALIZATION_SHEET_TAB_IDS.has(tab)) {
      return;
    }

    this._activeTab = tab;

    this.render();
  }
}
