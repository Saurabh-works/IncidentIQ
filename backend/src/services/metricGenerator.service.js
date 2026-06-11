import {
  getRuntimeServices,
  getIO,
  persistMetrics,
} from "./runtime.service.js";
import { setLatestMetrics } from "./cache.service.js";

export async function generateMetrics() {
  const metrics = getRuntimeServices().map((service) => ({
    ...service,
    serviceName: service.name,
    timestamp: new Date(),
  }));
  await setLatestMetrics(metrics);
  await persistMetrics();
  getIO()?.emit("metrics:update", metrics);
}

export const startMetricGenerator = () =>
  setInterval(() => generateMetrics().catch(console.error), 10000);
