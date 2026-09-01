/**
 * Tactical
 * Status Registry
 *
 * Stores Status Effect definitions used by the Tactical core system
 * and by genre modules.
 */

export class TacticalStatusRegistry {

  constructor() {
    this.statuses = new Map();
  }

  /**
   * Register a Status Effect.
   *
   * @param {string} id
   * Unique machine-readable identifier.
   *
   * @param {object} data
   * Status definition.
   *
   * Expected fields:
   * - name
   * - description
   * - source
   */
  register(id, data = {}) {

    if (!id || typeof id !== "string") {
      throw new Error(
        "Tactical | Status registration requires a valid string id."
      );
    }

    if (this.statuses.has(id)) {
      console.warn(
        `Tactical | Status "${id}" is already registered and will be replaced.`
      );
    }

    const status = {
      id,
      name: data.name ?? id,
      description: data.description ?? "",
      source: data.source ?? "tactical"
    };

    this.statuses.set(id, status);

    return status;
  }

  /**
   * Remove a registered Status.
   */
  unregister(id) {
    return this.statuses.delete(id);
  }

  /**
   * Retrieve one Status.
   */
  get(id) {
    return this.statuses.get(id);
  }

  /**
   * Check whether a Status exists.
   */
  has(id) {
    return this.statuses.has(id);
  }

  /**
   * Return all registered Statuses.
   */
  getAll() {
    return Array.from(this.statuses.values());
  }

  /**
   * Return all Statuses registered by a specific source.
   */
  getBySource(source) {
    return this.getAll().filter(
      status => status.source === source
    );
  }

  /**
   * Clear all registered Statuses.
   *
   * Primarily useful during development and testing.
   */
  clear() {
    this.statuses.clear();
  }
}
