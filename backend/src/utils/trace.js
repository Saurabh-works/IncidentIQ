import crypto from "node:crypto";

export const createTraceId = () => `trace-${crypto.randomUUID().slice(0, 12)}`;
