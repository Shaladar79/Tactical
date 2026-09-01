/**
 * Tactical
 * Character Sheet
 *
 * Foundry VTT v14 Actor sheet for Tactical player characters.
 */

import {
  rollCharacterCheck
} from "./character-rolls.mjs";

import {
  rollWeaponAttack
} from "../../combat/weapon-attack.mjs";

import {
  reloadWeapon
} from "../../combat/reload-weapon.mjs";

import {
  promptTacticalRoll
} from "../../dice/roll-dialog.mjs";

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
    },

    actions: {
      rollSkill: this.#onRollSkill,
      rollAttribute: this.#onRollAttribute,
      rollWeapon: this.#onRollWeapon,
      reloadWeapon: this.#onReloadWeapon
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
        ? skillRegistry.getAll().map(skill => {

            const attributeValue =
              Number(
                system.attributes?.[skill.attribute]
              ) || 0;

            const skillValue =
              Number(
                system.skills?.[skill.id]
              ) || 0;

            return {
              ...skill,

              value:
                skillValue,

              attributeValue,

              pool:
                attributeValue + skillValue
            };
          })
        : [];

    /* -------------------------------------------- */
    /*  Attributes                                  */
    /* -------------------------------------------- */

    const attributes = [
      {
        id: "might",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Might"
        ),
        value:
          Number(system.attributes?.might) || 0
      },

      {
        id: "aim",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Aim"
        ),
        value:
          Number(system.attributes?.aim) || 0
      },

      {
        id: "agility",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Agility"
        ),
        value:
          Number(system.attributes?.agility) || 0
      },

      {
        id: "endurance",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Endurance"
        ),
        value:
          Number(system.attributes?.endurance) || 0
      },

      {
        id: "focus",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Focus"
        ),
        value:
          Number(system.attributes?.focus) || 0
      },

      {
        id: "resolve",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Resolve"
        ),
        value:
          Number(system.attributes?.resolve) || 0
      },

      {
        id: "perception",
        name: game.i18n.localize(
          "TACTICAL.Attributes.Perception"
        ),
        value:
          Number(system.attributes?.perception) || 0
      }
    ];

    /* -------------------------------------------- */
    /*  Weapons                                     */
    /* -------------------------------------------- */

    const weapons =
      actor.items
        .filter(
          item =>
            item.type === "weapon"
        )
        .map(weapon => {

          const weaponSystem =
            weapon.system;

          const isMelee =
            weaponSystem.weaponType === "melee";

          const attributeId =
            isMelee
              ? "might"
              : "aim";

          const skillId =
            isMelee
              ? "melee"
              : "ranged";

          const attributeValue =
            Math.max(
              0,
              Number(
                system.attributes?.[attributeId]
              ) || 0
            );

          const skillValue =
            Math.max(
              0,
              Number(
                system.skills?.[skillId]
              ) || 0
            );

          return {
            id:
              weapon.id,

            name:
              weapon.name,

            img:
              weapon.img,

            weaponType:
              weaponSystem.weaponType,

            slot:
              weaponSystem.slot,

            dps:
              weaponSystem.dps ?? 0,

            penetration:
              weaponSystem.penetration ?? 0,

            usesMagazine:
              weaponSystem.usesMagazine !== false,

            magazineCapacity:
              weaponSystem.magazineCapacity ?? 0,

            ammoRemaining:
              weaponSystem.ammoRemaining ?? 0,

            intendedRange:
              weaponSystem.intendedRange ?? "short",

            attributeId,
            skillId,

            attributeValue,
            skillValue,

            pool:
              attributeValue + skillValue
          };
        });

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

      attributes,

      skills,

      weapons,

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

  /* -------------------------------------------- */
  /*  Skill Roll                                  */
  /* -------------------------------------------- */

  static async #onRollSkill(event, target) {

    const skillId =
      target.dataset.skill;

    if (!skillId) {
      return;
    }

    const skill =
      game.tactical?.registries?.skills?.get(
        skillId
      );

    if (!skill) {
      ui.notifications.warn(
        `Tactical | Unknown Skill: ${skillId}`
      );

      return;
    }

    const attributeId =
      skill.attribute;

    const attributeValue =
      Math.max(
        0,
        Number(
          this.actor.system.attributes?.[
            attributeId
          ]
        ) || 0
      );

    const skillValue =
      Math.max(
        0,
        Number(
          this.actor.system.skills?.[
            skillId
          ]
        ) || 0
      );

    const basePool =
      attributeValue + skillValue;

    const availableRankDice =
      Math.max(
        0,
        Number(
          this.actor.system.rankDice?.value
        ) || 0
      );

    const attributeName =
      attributeId
        ? attributeId.charAt(0).toUpperCase() +
          attributeId.slice(1)
        : "Attribute";

    const flavor =
      `${this.actor.name}: ${attributeName} + ${skill.name}`;

    const options =
      await promptTacticalRoll({
        title:
          flavor,

        basePool,

        baseTN:
          7,

        availableRankDice
      });

    if (!options) {
      return;
    }

    await rollCharacterCheck(
      this.actor,
      {
        attributeId,
        skillId,

        specialization:
          options.specialization,

        rankDie:
          options.rankDie,

        diceModifier:
          options.diceModifier,

        baseTN:
          7,

        flavor
      }
    );
  }

  /* -------------------------------------------- */
  /*  Attribute Roll                              */
  /* -------------------------------------------- */

  static async #onRollAttribute(event, target) {

    const attributeId =
      target.dataset.attribute;

    if (!attributeId) {
      return;
    }

    const attributeValue =
      this.actor.system.attributes?.[
        attributeId
      ];

    if (attributeValue === undefined) {

      ui.notifications.warn(
        `Tactical | Unknown Attribute: ${attributeId}`
      );

      return;
    }

    const basePool =
      Math.max(
        0,
        Number(attributeValue) || 0
      );

    const availableRankDice =
      Math.max(
        0,
        Number(
          this.actor.system.rankDice?.value
        ) || 0
      );

    const attributeName =
      attributeId.charAt(0).toUpperCase() +
      attributeId.slice(1);

    const flavor =
      `${this.actor.name}: ${attributeName} Check`;

    const options =
      await promptTacticalRoll({
        title:
          flavor,

        basePool,

        baseTN:
          7,

        availableRankDice
      });

    if (!options) {
      return;
    }

    await rollCharacterCheck(
      this.actor,
      {
        attributeId,

        specialization:
          options.specialization,

        rankDie:
          options.rankDie,

        diceModifier:
          options.diceModifier,

        baseTN:
          7,

        flavor
      }
    );
  }

  /* -------------------------------------------- */
  /*  Weapon Attack                               */
  /* -------------------------------------------- */

  static async #onRollWeapon(event, target) {

    const weaponId =
      target.dataset.weapon;

    if (!weaponId) {
      return;
    }

    const weapon =
      this.actor.items.get(
        weaponId
      );

    if (
      !weapon ||
      weapon.type !== "weapon"
    ) {

      ui.notifications.warn(
        "Tactical | Weapon could not be found."
      );

      return;
    }

    const isMelee =
      weapon.system.weaponType === "melee";

    /*
     * Default Tactical attack pairings:
     *
     * Melee weapon:
     * Might + Melee
     *
     * Ranged weapon:
     * Aim + Ranged
     */
    const attributeId =
      isMelee
        ? "might"
        : "aim";

    const skillId =
      isMelee
        ? "melee"
        : "ranged";

    await rollWeaponAttack(
      this.actor,
      weapon,
      {
        attributeId,
        skillId,

        flavor:
          `${this.actor.name}: ${weapon.name}`
      }
    );
  }

  /* -------------------------------------------- */
  /*  Reload Weapon                               */
  /* -------------------------------------------- */

  static async #onReloadWeapon(event, target) {

    const weaponId =
      target.dataset.weapon;

    if (!weaponId) {
      return;
    }

    const weapon =
      this.actor.items.get(
        weaponId
      );

    if (
      !weapon ||
      weapon.type !== "weapon"
    ) {

      ui.notifications.warn(
        "Tactical | Weapon could not be found."
      );

      return;
    }

    await reloadWeapon(
      weapon
    );
  }
}
