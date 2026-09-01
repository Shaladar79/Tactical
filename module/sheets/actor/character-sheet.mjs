/**
 * Tactical
 * Character Sheet
 *
 * Foundry VTT v14 Actor sheet for Tactical player characters.
 */

const {
  api,
  sheets
} = foundry.applications;

/**
 * Tactical Character Sheet
 */
export class TacticalCharacterSheet
  extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  /* -------------------------------------------- */
  /*  Application Options                         */
  /* -------------------------------------------- */

  static DEFAULT_OPTIONS = {
    classes: [
      "tactical",
      "actor",
      "character-sheet"
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
      title: "Tactical Character"
    }
  };

  /* -------------------------------------------- */
  /*  Handlebars Parts                            */
  /* -------------------------------------------- */

  static PARTS = {
    main: {
      template:
        "systems/tactical/templates/actor/character-sheet.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Context                                     */
  /* -------------------------------------------- */

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);

    const actor = this.actor;
    const system = actor.system;

    const earnedXP =
      Math.max(
        0,
        Number(system.xp?.earned) || 0
      );

    const spentXP =
      Math.max(
        0,
        Number(system.xp?.spent) || 0
      );

    const availableXP =
      Math.max(
        0,
        earnedXP - spentXP
      );

    /* -------------------------------------------- */
    /*  Skills                                      */
    /* -------------------------------------------- */

    const skillRegistry =
      game.tactical?.registries?.skills;

    const skills =
      skillRegistry
        ? skillRegistry.getAll().map(skill => ({
            ...skill,
            value:
              Number(
                system.skills?.[skill.id]
              ) || 0
          }))
        : [];

    /* -------------------------------------------- */
    /*  Sheet Context                               */
    /* -------------------------------------------- */

    return {
      ...context,

      actor,
      system,

      editable:
        this.isEditable,

      progression: {
        rank:
          system.rank ?? 0,

        earnedXP,
        spentXP,
        availableXP,

        rankDice: {
          value:
            system.rankDice?.value ?? 0,

          max:
            system.rankDice?.max ?? 0
        }
      },

      attributes:
        system.attributes ?? {},

      skills,

      combat: {
        health:
          system.health,

        wounds:
          system.wounds,

        armorIntegrity:
          system.armorIntegrity,

        toughness:
          system.toughness ?? 0,

        movement:
          system.movement ?? 0
      }
    };
  }
}
