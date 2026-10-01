import type { Engine } from "../schemas";

const SLOTS = 8;

/**
 * Each engine keeps one categorical color slot, taken from its position in the
 * backend's engine registry, so colors never shift when trackers use different subsets.
 */
export function engineColor(engines: Engine[] | undefined, name: string) {
  const index = engines?.findIndex((e) => e.name === name) ?? -1;
  const slot = (index < 0 ? SLOTS - 1 : Math.min(index, SLOTS - 1)) + 1;
  return `var(--series-${slot})`;
}

export function sortByRegistry<T>(items: T[], engines: Engine[] | undefined, nameOf: (item: T) => string) {
  const order = new Map(engines?.map((e, i) => [e.name, i]));
  return [...items].sort((a, b) => (order.get(nameOf(a)) ?? 99) - (order.get(nameOf(b)) ?? 99));
}
