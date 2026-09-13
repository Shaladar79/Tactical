/**
 * Tactical
 * Weapon Item Sheet
 *
 * Foundry VTT v14 Item sheet for Tactical
 * Weapon Items.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Weapon Sheet Tabs                          */
/* -------------------------------------------- */

const WEAPON_SHEET_TABS = [
  {
    id: "damage",
    label: "Damage"
  },
  {
    id: "ammunition",
    label: "Ammunition"
  },
  {
    id: "range",
    label: "Range"
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

const WEAPON_SHEET_TAB_IDS =
  new Set(
    WEAPON_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Weapon Sheet
 */
export class TacticalWeaponSheet
  extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "item",
      "weapon-sheet"
    ],

    position: {
      width: 680,
      height: 720
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Weapon"
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
        "systems/tactical/templates/item/weapon-sheet.hbs"
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
      WEAPON_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "damage";

    const tabs =
      WEAPON_SHEET_TABS.map(
        tab => ({
          ...tab,

          active:
            tab.id === activeTab
        })
      );

    /* -------------------------------------------- */
    /*  Range Overrides                            */
    /* -------------------------------------------- */

    const rangeOverrides =
      system.rangeOverrides ?? {};

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
          system.slot ?? "ranged",

        weaponType:
          system.weaponType ?? "ranged",

        technologyType:
          system.technologyType ?? ""
      },

      damage: {
        dps:
          Math.max(
            0,
            Number(system.dps) || 0
          ),

        penetration:
          Math.max(
            0,
            Number(system.penetration) || 0
          )
      },

      ammunition: {
        magazineCapacity:
          Math.max(
            0,
            Number(system.magazineCapacity) || 0
          ),

        ammoRemaining:
          Math.max(
            0,
            Number(system.ammoRemaining) || 0
          ),

        usesMagazine:
          system.usesMagazine !== false
      },

      range: {
        intendedRange:
          system.intendedRange ?? "short",

        minimumRange:
          Math.max(
            0,
            Number(system.minimumRange) || 0
          ),

        maximumRange:
          Math.max(
            0,
            Number(system.maximumRange) || 0
          ),

        overrides: {
          melee:
            rangeOverrides.melee ?? "",

          short:
            rangeOverrides.short ?? "",

          medium:
            rangeOverrides.medium ?? "",

          long:
            rangeOverrides.long ?? "",

          extreme:
            rangeOverrides.extreme ?? ""
        }
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
      !WEAPON_SHEET_TAB_IDS.has(
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
