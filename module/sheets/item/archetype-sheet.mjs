/**
 * Tactical
 * Archetype Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical
 * Archetype Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Archetype Sheet Tabs                       */
/* -------------------------------------------- */

const ARCHETYPE_SHEET_TABS = [
  {
    id: "overview",
    label: "Overview"
  },
  {
    id: "features",
    label: "Features"
  },
  {
    id: "equipment",
    label: "Equipment"
  },
  {
    id: "traits",
    label: "Traits"
  },
  {
    id: "progression",
    label: "Progression"
  }
];

const ARCHETYPE_SHEET_TAB_IDS =
  new Set(
    ARCHETYPE_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Archetype Sheet
 */
export class TacticalArchetypeSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item",
      "archetype-sheet"
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
      title: "Tactical Archetype"
    },

    actions: {
      switchTab:
        this.#onSwitchTab,

      addSpecialization:
        this.#onAddSpecialization,

      removeSpecialization:
        this.#onRemoveSpecialization,

      addAbility:
        this.#onAddAbility,

      removeAbility:
        this.#onRemoveAbility,

      addTalent:
        this.#onAddTalent,

      removeTalent:
        this.#onRemoveTalent,

      addPermission:
        this.#onAddPermission,

      removePermission:
        this.#onRemovePermission,

      addEquipment:
        this.#onAddEquipment,

      removeEquipment:
        this.#onRemoveEquipment,

      addTrait:
        this.#onAddTrait,

      removeTrait:
        this.#onRemoveTrait
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                           */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/item/archetype-sheet.hbs"
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

    const activeTab =
      ARCHETYPE_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "overview";

    const tabs =
      ARCHETYPE_SHEET_TABS.map(
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

      classification: {
        archetypeType:
          system.archetypeType ?? "",

        sourceModule:
          system.sourceModule ?? "tactical"
      },

      progression: {
        minimumRank:
          Math.max(
            0,
            Number(
              system.minimumRank
            ) || 0
          )
      },

      grantedSpecializations:
        Array.isArray(
          system.grantedSpecializations
        )
          ? system.grantedSpecializations
          : [],

      grantedAbilities:
        Array.isArray(
          system.grantedAbilities
        )
          ? system.grantedAbilities
          : [],

      grantedTalents:
        Array.isArray(
          system.grantedTalents
        )
          ? system.grantedTalents
          : [],

      equipmentPermissions:
        Array.isArray(
          system.equipmentPermissions
        )
          ? system.equipmentPermissions
          : [],

      standardEquipment:
        Array.isArray(
          system.standardEquipment
        )
          ? system.standardEquipment
          : [],

      traits:
        Array.isArray(
          system.traits
        )
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
      !ARCHETYPE_SHEET_TAB_IDS.has(
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
  /*  Generic Array Helpers                      */
  /* -------------------------------------------- */

  static async #appendToArray(
    fieldName
  ) {

    const current =
      this.item.system[
        fieldName
      ];

    const values =
      Array.isArray(current)
        ? [
            ...current
          ]
        : [];

    values.push("");

    await this.item.update({
      [`system.${fieldName}`]:
        values
    });
  }

  static async #removeFromArray(
    fieldName,
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

    const current =
      this.item.system[
        fieldName
      ];

    const values =
      Array.isArray(current)
        ? [
            ...current
          ]
        : [];

    if (
      index < 0 ||
      index >= values.length
    ) {
      return;
    }

    values.splice(
      index,
      1
    );

    await this.item.update({
      [`system.${fieldName}`]:
        values
    });
  }

  /* -------------------------------------------- */
  /*  Granted Specializations                    */
  /* -------------------------------------------- */

  static async #onAddSpecialization() {

    await this.#appendToArray(
      "grantedSpecializations"
    );
  }

  static async #onRemoveSpecialization(
    event,
    target
  ) {

    await this.#removeFromArray(
      "grantedSpecializations",
      target
    );
  }

  /* -------------------------------------------- */
  /*  Granted Abilities                          */
  /* -------------------------------------------- */

  static async #onAddAbility() {

    await this.#appendToArray(
      "grantedAbilities"
    );
  }

  static async #onRemoveAbility(
    event,
    target
  ) {

    await this.#removeFromArray(
      "grantedAbilities",
      target
    );
  }

  /* -------------------------------------------- */
  /*  Granted Talents                            */
  /* -------------------------------------------- */

  static async #onAddTalent() {

    await this.#appendToArray(
      "grantedTalents"
    );
  }

  static async #onRemoveTalent(
    event,
    target
  ) {

    await this.#removeFromArray(
      "grantedTalents",
      target
    );
  }

  /* -------------------------------------------- */
  /*  Equipment Permissions                      */
  /* -------------------------------------------- */

  static async #onAddPermission() {

    await this.#appendToArray(
      "equipmentPermissions"
    );
  }

  static async #onRemovePermission(
    event,
    target
  ) {

    await this.#removeFromArray(
      "equipmentPermissions",
      target
    );
  }

  /* -------------------------------------------- */
  /*  Standard Equipment                         */
  /* -------------------------------------------- */

  static async #onAddEquipment() {

    await this.#appendToArray(
      "standardEquipment"
    );
  }

  static async #onRemoveEquipment(
    event,
    target
  ) {

    await this.#removeFromArray(
      "standardEquipment",
      target
    );
  }

  /* -------------------------------------------- */
  /*  Traits                                     */
  /* -------------------------------------------- */

  static async #onAddTrait() {

    await this.#appendToArray(
      "traits"
    );
  }

  static async #onRemoveTrait(
    event,
    target
  ) {

    await this.#removeFromArray(
      "traits",
      target
    );
  }
}
