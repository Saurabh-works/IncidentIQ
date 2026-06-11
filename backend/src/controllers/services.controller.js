import Service from "../models/Service.js";
import {
  getRuntimeIncidents,
  getRuntimeServices,
  publicServices,
  setRuntimeServices,
  syncRuntime,
} from "../services/runtime.service.js";
import { testExternalConnection } from "../services/externalMonitor.service.js";

export const getServices = (req, res) => res.json(publicServices());
export function getService(req, res) {
  const service = getRuntimeServices().find(
    (item) => String(item._id) === req.params.id || item.name === req.params.id,
  );
  if (!service) return res.status(404).json({ message: "Service not found" });
  const { controlKey, ...safeService } = service;
  return res.json(safeService);
}
export async function resetServices(req, res, next) {
  try {
    await Service.updateMany(
      {},
      {
        status: "healthy",
        requestCount: 0,
        errorCount: 0,
        avgLatency: 100,
        p95Latency: 150,
        lastUpdated: new Date(),
      },
    );
    setRuntimeServices(
      (await Service.find().select("+controlKey").lean()).map((item) => ({
        ...item,
        _id: String(item._id),
      })),
    );
    await syncRuntime();
    res.json(publicServices());
  } catch (error) {
    next(error);
  }
}

function validateExternalPayload(payload) {
  const url = new URL(payload.baseUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Base URL must use http or https.");
  if (!payload.name?.trim() || !payload.controlKey?.trim())
    throw new Error("Name and control key are required.");
}

export async function createExternalService(req, res, next) {
  try {
    validateExternalPayload(req.body);
    const candidate = {
      name: req.body.name.trim(),
      mode: "external",
      baseUrl: req.body.baseUrl.replace(/\/+$/, ""),
      healthEndpoint: req.body.healthEndpoint || "/health",
      testEndpoint: req.body.testEndpoint || "/api/products",
      controlKey: req.body.controlKey,
    };
    await testExternalConnection(candidate);
    const created = await Service.create(candidate);
    const plain = {
      ...created.toObject(),
      controlKey: candidate.controlKey,
      _id: String(created._id),
    };
    setRuntimeServices([...getRuntimeServices(), plain]);
    await syncRuntime();
    const { controlKey, ...safeService } = plain;
    res.status(201).json(safeService);
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "A service with that name already exists." });
    next(error);
  }
}

export async function testExternalService(req, res, next) {
  try {
    const service = getRuntimeServices().find(
      (item) => String(item._id) === req.params.id && item.mode === "external",
    );
    if (!service)
      return res.status(404).json({ message: "External service not found." });
    res.json(await testExternalConnection(service));
  } catch (error) {
    next(error);
  }
}

export async function deleteExternalService(req, res, next) {
  try {
    const service = getRuntimeServices().find(
      (item) => String(item._id) === req.params.id && item.mode === "external",
    );
    if (!service)
      return res.status(404).json({ message: "External service not found." });
    if (getRuntimeIncidents().some((item) => item.serviceName === service.name))
      return res
        .status(409)
        .json({
          message: "Resolve active incidents before deleting this service.",
        });
    await Service.findByIdAndDelete(service._id);
    setRuntimeServices(
      getRuntimeServices().filter(
        (item) => String(item._id) !== String(service._id),
      ),
    );
    await syncRuntime();
    res.json({ message: "External service removed." });
  } catch (error) {
    next(error);
  }
}
