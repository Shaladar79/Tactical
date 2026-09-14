/**
 * Tactical
 * Ancestry Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical
 * Ancestry Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Ancestry Sheet Tabs                        */
/* -------------------------------------------- */

const ANCESTRY_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "attributes",
    label: "Attributes"
  },
  {
    id: "traits",
    label: "Traits"
  },
  {
    id: "abilities",
    label: "Abilities"
  }
];

const ANCESTRY_SHEET_TAB_IDS =
  new Set(
    ANCESTRY_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Ancestry Sheet
 */
export class TacticalAncestrySheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item",
      "ancestry-sheet"
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
      title: "Tactical Ancestry"
    },

    actions: {
      switchTab:
        this.#onSwitchTab,

      addTrait:
        this.#onAddTrait,

      removeTrait:
        this.#onRemoveTrait,

      addAbility:
        this.#onAddAbility,

      removeAbility:
        this.#onRemoveAbility
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                           */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/item/ancestry-sheet.hbs"
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
      ANCESTRY_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "overview";

    const tabs =
      ANCESTRY_SHEET_TABS.map(
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
        ancestryType:
          system.ancestryType ?? "",

        sourceModule:
          system.sourceModule ?? "tactical"
      },

      attributeModifiers: {
        might:
          Number(
            system.mightModifier
          ) || 0,

        precision:
          Number(
            system.precisionModifier
          ) || 0,

        agility:
          Number(
            system.agilityModifier
          ) || 0,

        endurance:
          Number(
            system.enduranceModifier
          ) || 0,

        focus:
          Number(
            system.focusModifier
          ) || 0,

        resolve:
          Number(
            system.resolveModifier
          ) || 0,

        perception:
          Number(
            system.perceptionModifier
          ) || 0
      },

      otherModifiers: {
        movement:
          Number(
            system.movementModifier
          ) || 0,

        health:
          Number(
            system.healthModifier
          ) || 0,

        wounds:
          Number(
            system.woundModifier
          ) || 0
      },

      traits:
        Array.isArray(
          system.traits
        )
          ? system.traits
          : [],

      grantedAbilities:
        Array.isArray(
          system.grantedAbilities
        )
          ? system.grantedAbilities
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
      !ANCESTRY_SHEET_TAB_IDS.has(
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

  /* -------------------------------------------- */
  /*  Trait Controls                             */
  /* -------------------------------------------- */

  static async #onAddTrait() {

    const traits =
      Array.isArray(
        this.item.system.traits
      )
        ? [
            ...this.item.system.traits
          ]
        : [];

    traits.push("");

    await this.item.update({
      "system.traits":
        traits
    });
  }

  static async #onRemoveTrait(
    event,
    target
  ) {

    const index =
      Number(
        target.dataset.index
      );

    if (
      !Number.isInteger(index)
    ) {
      return;
    }

    const traits =
      Array.isArray(
        this.item.system.traits
      )
        ? [
            ...this.item.system.traits
          ]
        : [];

    if (
      index < 0 ||
      index >= traits.length
    ) {
      return;
    }

    traits.splice(
      index,
      1
    );

    await this.item.update({
      "system.traits":
        traits
    });
  }

  /* -------------------------------------------- */
  /*  Ability Controls                           */
  /* -------------------------------------------- */

  static async #onAddAbility() {

    const grantedAbilities =
      Array.isArray(
        this.item.system.grantedAbilities
      )
        ? [
            ...this.item.system.grantedAbilities
          ]
        : [];

    grantedAbilities.push("");

    await this.item.update({
      "system.grantedAbilities":
        grantedAbilities
    });
  }

  static async #onRemoveAbility(
    event,
    target
  ) {

    const index =
      Number(
        target.dataset.index
      );

    if (
      !Number.isInteger(index)
    ) {
      return;
    }

    const grantedAbilities =
      Array.isArray(
        this.item.system.grantedAbilities
      )
        ? [
            ...this.item.system.grantedAbilities
          ]
        : [];

    if (
      index < 0 ||
      index >= grantedAbilities.length
    ) {
      return;
    }

    grantedAbilities.splice(
      index,
      1
    );

    await this.item.update({
      "system.grantedAbilities":
        grantedAbilities
    });
  }
}
