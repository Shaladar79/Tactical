/**
 * Tactical
 * Enemy Actor Sheet
 *
 * Foundry VTT v14 Actor sheet for Tactical
 * unified Enemy Actors.
 */

const {
  api,
  sheets
} = foundry.applications;

/* -------------------------------------------- */
/*  Enemy Classes                              */
/* -------------------------------------------- */

const ENEMY_CLASSES = [
  {
    id: "trooper",
    label: "Trooper"
  },
  {
    id: "lieutenant",
    label: "Lieutenant"
  },
  {
    id: "commander",
    label: "Commander"
  },
  {
    id: "overlord",
    label: "Overlord"
  }
];

const ENEMY_CLASS_IDS =
  new Set(
    ENEMY_CLASSES.map(
      enemyClass => enemyClass.id
    )
  );

/* -------------------------------------------- */
/*  Enemy Sheet Tabs                           */
/* -------------------------------------------- */

const ENEMY_SHEET_TABS = [
  {
    id: "combat",
    label: "Combat"
  },
  {
    id: "attributes",
    label: "Attributes"
  },
  {
    id: "saves",
    label: "Saves"
  },
  {
    id: "attack",
    label: "Attack"
  }
];

const ENEMY_SHEET_TAB_IDS =
  new Set(
    ENEMY_SHEET_TABS.map(
      tab => tab.id
    )
  );

/**
 * Tactical Enemy Sheet
 */
export class TacticalEnemySheet
  extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                        */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "actor",
      "enemy-sheet"
    ],

    position: {
      width: 720,
      height: 760
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      resizable: true,
      title: "Tactical Enemy"
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
        "systems/tactical/templates/actor/enemy-sheet.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Context                                    */
  /* -------------------------------------------- */

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);

    const actor =
      this.actor;

    const system =
      actor.system;

    /* -------------------------------------------- */
    /*  Enemy Class                                 */
    /* -------------------------------------------- */

    const enemyClass =
      ENEMY_CLASS_IDS.has(
        system.enemyClass
      )
        ? system.enemyClass
        : "trooper";

    const enemyClasses =
      ENEMY_CLASSES.map(
        entry => ({
          ...entry,

          selected:
            entry.id === enemyClass
        })
      );

    const isTrooper =
      enemyClass === "trooper";

    const isLieutenant =
      enemyClass === "lieutenant";

    const isCommander =
      enemyClass === "commander";

    const isOverlord =
      enemyClass === "overlord";

    const usesWounds =
      !isTrooper;

    const usesDerivedWounds =
      isLieutenant ||
      isCommander;

    const usesManualWounds =
      isOverlord;

    const usesReactions =
      isOverlord;

    /* -------------------------------------------- */
    /*  Tab State                                   */
    /* -------------------------------------------- */

    const activeTab =
      ENEMY_SHEET_TAB_IDS.has(
        this._activeTab
      )
        ? this._activeTab
        : "combat";

    const tabs =
      ENEMY_SHEET_TABS.map(
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

      actor,
      system,

      editable:
        this.isEditable,

      activeTab,

      tabs,

      enemyClass,
      enemyClasses,

      isTrooper,
      isLieutenant,
      isCommander,
      isOverlord,

      usesWounds,
      usesDerivedWounds,
      usesManualWounds,
      usesReactions,

      progression: {
        tier:
          Math.max(
            1,
            Number(system.tier) || 1
          ),

        rank:
          Math.max(
            0,
            Number(system.rank) || 0
          )
      },

      combat: {
        health: {
          value:
            Math.max(
              0,
              Number(system.health?.value) || 0
            ),

          max:
            Math.max(
              0,
              Number(system.health?.max) || 0
            )
        },

        wounds: {
          value:
            Math.max(
              0,
              Number(system.wounds?.value) || 0
            ),

          max:
            Math.max(
              0,
              Number(system.wounds?.max) || 0
            )
        },

        armorIntegrity: {
          value:
            Math.max(
              0,
              Number(system.armorIntegrity?.value) || 0
            ),

          max:
            Math.max(
              0,
              Number(system.armorIntegrity?.max) || 0
            )
        },

        movement:
          Math.max(
            0,
            Number(system.movement) || 0
          ),

        initiative:
          Math.max(
            0,
            Number(system.initiative) || 0
          ),

        resolve:
          Math.max(
            0,
            Number(system.resolve) || 0
          ),

        toughness:
          Math.max(
            0,
            Number(system.toughness) || 0
          ),

        reactionsPerRound:
          Math.max(
            0,
            Number(system.reactionsPerRound) || 0
          )
      },

      attributes: {
        might:
          Math.max(
            0,
            Number(system.attributes?.might) || 0
          ),

        precision:
          Math.max(
            0,
            Number(system.attributes?.precision) || 0
          ),

        agility:
          Math.max(
            0,
            Number(system.attributes?.agility) || 0
          ),

        endurance:
          Math.max(
            0,
            Number(system.attributes?.endurance) || 0
          ),

        focus:
          Math.max(
            0,
            Number(system.attributes?.focus) || 0
          ),

        resolve:
          Math.max(
            0,
            Number(system.attributes?.resolve) || 0
          ),

        perception:
          Math.max(
            0,
            Number(system.attributes?.perception) || 0
          )
      },

      saveBonuses: {
        might:
          Math.max(
            0,
            Number(system.saveBonuses?.might) || 0
          ),

        precision:
          Math.max(
            0,
            Number(system.saveBonuses?.precision) || 0
          ),

        agility:
          Math.max(
            0,
            Number(system.saveBonuses?.agility) || 0
          ),

        endurance:
          Math.max(
            0,
            Number(system.saveBonuses?.endurance) || 0
          ),

        focus:
          Math.max(
            0,
            Number(system.saveBonuses?.focus) || 0
          ),

        resolve:
          Math.max(
            0,
            Number(system.saveBonuses?.resolve) || 0
          ),

        perception:
          Math.max(
            0,
            Number(system.saveBonuses?.perception) || 0
          )
      },

      attack: {
        attackPool:
          Math.max(
            0,
            Number(system.attackPool) || 0
          )
      }
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
      !ENEMY_SHEET_TAB_IDS.has(
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
