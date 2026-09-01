/**
 * Tactical
 * Skill Registry
 *
 * Stores Skill definitions used by the Tactical core system
 * and by genre modules.
 */

export class TacticalSkillRegistry {

  constructor() {
    this.skills = new Map();
  }

  /**
   * Register a Skill.
   *
   * @param {string} id
   * Unique machine-readable identifier.
   *
   * @param {object} data
   * Skill definition.
   *
   * Expected fields:
   * - name
   * - attribute
   * - description
   * - source
   */
  register(id, data = {}) {

    if (!id || typeof id !== "string") {
      throw new Error(
        "Tactical | Skill registration requires a valid string id."
      );
    }

    if (this.skills.has(id)) {
      console.warn(
        `Tactical | Skill "${id}" is already registered and will be replaced.`
      );
    }

    const skill = {
      id,
      name: data.name ?? id,
      attribute: data.attribute ?? "",
      description: data.description ?? "",
      source: data.source ?? "tactical"
    };

    this.skills.set(id, skill);

    return skill;
  }

  /**
   * Remove a registered Skill.
   */
  unregister(id) {
    return this.skills.delete(id);
  }

  /**
   * Retrieve one Skill.
   */
  get(id) {
    return this.skills.get(id);
  }

  /**
   * Check whether a Skill exists.
   */
  has(id) {
    return this.skills.has(id);
  }

  /**
   * Return all registered Skills.
   */
  getAll() {
    return Array.from(this.skills.values());
  }

  /**
   * Return all Skills registered by a specific source.
   *
   * Example:
   * getBySource("invasion")
   */
  getBySource(source) {
    return this.getAll().filter(
      skill => skill.source === source
    );
  }

  /**
   * Clear all registered Skills.
   *
   * Primarily useful during development and testing.
   */
  clear() {
    this.skills.clear();
  }
}
