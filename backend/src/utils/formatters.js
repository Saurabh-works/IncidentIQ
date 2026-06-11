export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const randomBetween = (min, max) =>
  Math.round(min + Math.random() * (max - min));
export const asPlain = (value) => JSON.parse(JSON.stringify(value));
