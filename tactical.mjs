/**
 * Tactical
 * Core Foundry VTT system bootstrap.
 *
 * Genre-specific content should be provided by modules such as Invasion.
 */

Hooks.once("init", () => {
  console.log("Tactical | Initializing Tactical system");

  /**
   * Public Tactical API.
   *
   * Future genre modules can access shared Tactical functionality through:
   *
   * game.tactical
   *
   * We will expand this API as the core system is built.
   */
  game.tactical = {
    version: "0.1.0",

    registries: {
      skills: new Map(),
      statuses: new Map(),
      equipmentTraits: new Map(),
      extensions: new Map()
    }
  };
});

Hooks.once("ready", () => {
  console.log("Tactical | Ready");
});
