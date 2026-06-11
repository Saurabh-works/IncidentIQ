import { redisClient } from "../config/redis.js";
import { REDIS_KEYS } from "../utils/constants.js";

const memory = new Map();
const available = () => redisClient.isReady;

export async function getJSON(key) {
  try {
    const value = available() ? await redisClient.get(key) : memory.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function setJSON(key, value, ttl) {
  const serialized = JSON.stringify(value);
  memory.set(key, serialized);
  try {
    if (available())
      await redisClient.set(key, serialized, ttl ? { EX: ttl } : {});
  } catch {}
  return value;
}

export async function deleteKey(key) {
  memory.delete(key);
  try {
    if (available()) await redisClient.del(key);
  } catch {}
}

export async function pushRecentLog(log) {
  try {
    if (available()) {
      await redisClient.lPush(REDIS_KEYS.recentLogs, JSON.stringify(log));
      await redisClient.lTrim(REDIS_KEYS.recentLogs, 0, 99);
      return;
    }
  } catch {}
  const logs = (await getJSON(REDIS_KEYS.recentLogs)) || [];
  await setJSON(REDIS_KEYS.recentLogs, [log, ...logs].slice(0, 100));
}

export async function getRecentLogs() {
  try {
    if (available())
      return (await redisClient.lRange(REDIS_KEYS.recentLogs, 0, 99)).map(
        JSON.parse,
      );
  } catch {}
  return (await getJSON(REDIS_KEYS.recentLogs)) || [];
}

export const setServicesState = (v) => setJSON(REDIS_KEYS.services, v);
export const getServicesState = () => getJSON(REDIS_KEYS.services);
export const setActiveIncidents = (v) => setJSON(REDIS_KEYS.activeIncidents, v);
export const getActiveIncidents = () => getJSON(REDIS_KEYS.activeIncidents);
export const setLatestMetrics = (v) => setJSON(REDIS_KEYS.latestMetrics, v);
export const getLatestMetrics = () => getJSON(REDIS_KEYS.latestMetrics);
export const setDashboardSummary = (v) =>
  setJSON(REDIS_KEYS.dashboardSummary, v, 15);
export const getDashboardSummary = () => getJSON(REDIS_KEYS.dashboardSummary);
