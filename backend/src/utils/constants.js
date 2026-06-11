export const SERVICE_NAMES = [
  "API Gateway",
  "User Service",
  "Order Service",
  "Payment Service",
  "Inventory Service",
  "Notification Service",
];

export const INCIDENT_TYPES = [
  "LATENCY_SPIKE",
  "ERROR_RATE_INCREASE",
  "SERVICE_DOWN",
  "MEMORY_LEAK_SIMULATION",
  "DATABASE_SLOWDOWN",
];

export const SEVERITIES = ["low", "medium", "high", "critical"];

export const REDIS_KEYS = {
  services: "incidentiq:services",
  activeIncidents: "incidentiq:active_incidents",
  recentLogs: "incidentiq:recent_logs",
  dashboardSummary: "incidentiq:dashboard_summary",
  latestMetrics: "incidentiq:metrics:latest",
};

export const severityMultiplier = {
  low: 1,
  medium: 1.7,
  high: 2.6,
  critical: 4,
};
