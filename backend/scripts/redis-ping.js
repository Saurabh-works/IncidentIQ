import "dotenv/config";
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });

client.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

try {
  await client.connect();
  console.log("Redis response:", await client.ping());
  await client.quit();
} catch (error) {
  console.error("Redis ping failed:", error.message);
  process.exitCode = 1;
  if (client.isOpen) await client.disconnect();
}
