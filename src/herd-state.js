// Work out where each animal is, and what its tracker reported, at a point in
// the event feed. Used by the herd view and its day playback.

export function sortEvents(events) {
  return [...(events || [])].sort((a, b) => String(a.time).localeCompare(String(b.time)) || String(a.id).localeCompare(String(b.id)));
}

/**
 * State after the first `count` events. Animals start at their first
 * positioned event, or at their own x and y when no event has a position.
 */
export function stateAt(animals, events, count) {
  const sorted = sortEvents(events);
  const upto = sorted.slice(0, Math.max(0, count));
  const byId = new Map();
  for (const animal of animals) {
    const first = sorted.find((event) => event.animalId === animal.id && Number.isFinite(event.x));
    byId.set(animal.id, {
      ...animal,
      x: first ? first.x : animal.x,
      y: first ? first.y : animal.y,
      battery: first && Number.isFinite(first.battery) ? first.battery : animal.battery,
      lastSeen: null,
      silent: false,
      sos: false,
    });
  }
  const alerts = new Map();
  let smoke = false;
  for (const event of upto) {
    const animal = byId.get(event.animalId);
    if (animal) {
      if (Number.isFinite(event.x) && Number.isFinite(event.y)) {
        animal.x = event.x;
        animal.y = event.y;
      }
      if (Number.isFinite(event.battery)) animal.battery = event.battery;
      if (event.type === "checkin") {
        animal.lastSeen = event.time;
        animal.silent = false;
      }
      if (event.type === "silent") animal.silent = true;
      if (event.type === "sos") animal.sos = true;
    }
    if (event.type === "predator" && event.cell) alerts.set(event.cell, event);
    if (event.type === "predator-clear" && event.cell) alerts.delete(event.cell);
    if (event.type === "smoke") smoke = true;
    if (event.type === "smoke-clear") smoke = false;
  }
  if (upto.length >= sorted.length) {
    for (const animal of animals) {
      const state = byId.get(animal.id);
      if (!state.lastSeen && animal.lastSeen) state.lastSeen = animal.lastSeen;
      if (animal.silent) state.silent = true;
    }
  }
  return { animals: [...byId.values()], alertCells: [...alerts.keys()], smoke, shown: upto };
}

/**
 * Steps worth jumping to in the sample day: each alert just before it
 * clears, so the grid shows the alert and what the herd did about it.
 * Returns [{ id, label, step, time }] in time order.
 */
export function keyMoments(events) {
  const sorted = sortEvents(events);
  const out = [];
  const add = (id, label, startType, clearType) => {
    const start = sorted.findIndex((e) => e.type === startType);
    if (start < 0) return;
    const clear = sorted.findIndex((e, i) => i > start && e.type === clearType && (!sorted[start].cell || e.cell === sorted[start].cell));
    const step = clear > start ? clear : start + 1;
    out.push({ id, label, step, time: sorted[start].time });
  };
  add("smoke", "Smoke", "smoke", "smoke-clear");
  add("predator", "Predator", "predator", "predator-clear");
  return out.sort((a, b) => a.step - b.step);
}
