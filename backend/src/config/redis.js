import { createClient } from "redis";

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("connect", () => console.log("Redis connecting"));
redisClient.on("ready", () => console.log("Redis connected"));
redisClient.on("reconnecting", () => console.log("Redis reconnecting"));
redisClient.on("error", (error) =>
  console.warn("Redis unavailable:", error.message),
);

export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      const connection = redisClient.connect().catch((error) => {
        console.warn("Redis connection attempt failed:", error.message);
        return false;
      });
      await Promise.race([
        connection,
        new Promise((resolve) => setTimeout(() => resolve(false), 2000)),
      ]);
    }
    return true;
  } catch (error) {
    console.warn("Continuing without Redis:", error.message);
    return false;
  }
}
