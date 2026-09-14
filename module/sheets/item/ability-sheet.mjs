/**
 * Tactical
 * Ability Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical Abilities.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Ability Sheet Tabs                          */
/* -------------------------------------------- */

const ABILITY_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "action",
    label: "Action"
  },
  {
    id: "usage",
    label: "Usage"
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

const ABILITY_SHEET_TAB_IDS =
  new Set(
    ABILITY_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Ability Sheet
 */
export class TacticalAbilitySheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item-sheet",
      "ability-sheet"
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
      title: "Tactical Ability"
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
        "systems/tactical/templates/item/ability-sheet.hbs"
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
      ABILITY_SHEET_TAB_IDS.has(this._activeTab)
        ? this._activeTab
        : "overview";

    const tabs =
      ABILITY_SHEET_TABS.map(
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

      action: {
        actionCost:
          Math.max(
            0,
            Number(system.actionCost) || 0
          ),

        isReaction:
          system.isReaction === true,

        range:
          Math.max(
            0,
            Number(system.range) || 0
          )
      },

      usage: {
        usesPerEncounter:
          Math.max(
            0,
            Number(system.usesPerEncounter) || 0
          ),

        usesPerRound:
          Math.max(
            0,
            Number(system.usesPerRound) || 0
          ),

        cooldownTurns:
          Math.max(
            0,
            Number(system.cooldownTurns) || 0
          )
      },

      requirements: {
        minimumRank:
          Math.max(
            0,
            Number(system.minimumRank) || 0
          ),

        requiredArchetype:
          system.requiredArchetype ?? ""
      },

      classification: {
        abilityType:
          system.abilityType ?? "",

        sourceModule:
          system.sourceModule ?? "tactical"
      }
    };
  }

  /* -------------------------------------------- */
  /*  Actions                                    */
  /* -------------------------------------------- */

  static #onSwitchTab(event, target) {

    const tab =
      target.dataset.tab;

    if (!ABILITY_SHEET_TAB_IDS.has(tab)) {
      return;
    }

    this._activeTab = tab;

    this.render();
  }
}
