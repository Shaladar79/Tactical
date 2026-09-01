/**
 * Tactical
 * Equipment Trait Registry
 *
 * Stores generic equipment traits used by Tactical
 * and by genre modules.
 */

export class TacticalEquipmentTraitRegistry {

  constructor() {
    this.traits = new Map();
  }

  register(id, data = {}) {

    if (!id || typeof id !== "string") {
      throw new Error(
        "Tactical | Equipment Trait registration requires a valid string id."
      );
    }

    if (this.traits.has(id)) {
      console.warn(
        `Tactical | Equipment Trait "${id}" is already registered and will be replaced.`
      );
    }

    const trait = {
      id,
      name: data.name ?? id,
      description: data.description ?? "",
      source: data.source ?? "tactical"
    };

    this.traits.set(id, trait);

    return trait;
  }

  unregister(id) {
    return this.traits.delete(id);
  }

  get(id) {
    return this.traits.get(id);
  }

  has(id) {
    return this.traits.has(id);
  }

  getAll() {
    return Array.from(this.traits.values());
  }

  getBySource(source) {
    return this.getAll().filter(
      trait => trait.source === source
    );
  }

  clear() {
    this.traits.clear();
  }
}
