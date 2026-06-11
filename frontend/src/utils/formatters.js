export const number = (value = 0) =>
  Intl.NumberFormat("en", {
    notation: value > 9999 ? "compact" : "standard",
  }).format(value);
export const time = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";
export const dateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";
export const label = (value = "") =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
export const errorRate = (service) =>
  service.requestCount
    ? ((service.errorCount / service.requestCount) * 100).toFixed(1)
    : "0.0";
