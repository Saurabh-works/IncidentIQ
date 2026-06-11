import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";
import { useSocket } from "../hooks/useSocket";
import ChartCard from "../components/ChartCard";
import { Box } from "@mui/material";
const colors = [
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#60a5fa",
];
export default function Metrics() {
  const [metrics, setMetrics] = useState([]),
    [latest, setLatest] = useState([]);
  useEffect(() => {
    Promise.all([
      api.get("/metrics?limit=500"),
      api.get("/metrics/latest"),
    ]).then(([a, b]) => {
      setMetrics(a.data);
      setLatest(b.data);
    });
  }, []);
  useSocket(
    "metrics:update",
    useCallback((items) => {
      setLatest(items);
      setMetrics((old) => [...old, ...items].slice(-500));
    }, []),
  );
  const serviceNames = [
    ...new Set([
      ...latest.map((item) => item.serviceName),
      ...metrics.map((item) => item.serviceName),
    ]),
  ];
  const latencyData = Object.values(
    metrics.slice(-240).reduce((groups, item) => {
      const key = item.timestamp;
      groups[key] ||= { timestamp: key };
      groups[key][item.serviceName] = item.avgLatency;
      return groups;
    }, {}),
  ).slice(-40);
  const tooltip = {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 6,
  };
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xl: "repeat(2,1fr)" }, gap: 3 }}>
      <ChartCard title="Average latency" subtitle="Milliseconds over time">
        <ResponsiveContainer>
          <LineChart data={latencyData}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={tooltip} />
            <Legend />
            {serviceNames.map((service, i) => (
              <Line
                key={service}
                dataKey={service}
                name={service}
                stroke={colors[i % colors.length]}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="P95 latency" subtitle="Tail latency by service">
        <ResponsiveContainer>
          <AreaChart data={metrics.slice(-120)}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={tooltip} />
            <Area dataKey="p95Latency" stroke="#a78bfa" fill="#a78bfa22" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Request volume" subtitle="Cumulative request count">
        <ResponsiveContainer>
          <BarChart data={latest}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis
              dataKey="serviceName"
              tick={{ fontSize: 10 }}
              stroke="#64748b"
            />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={tooltip} />
            <Bar dataKey="requestCount" fill="#22d3ee" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Error count" subtitle="Cumulative errors by service">
        <ResponsiveContainer>
          <BarChart data={latest}>
            <CartesianGrid stroke="#1e293b" />
            <XAxis
              dataKey="serviceName"
              tick={{ fontSize: 10 }}
              stroke="#64748b"
            />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={tooltip} />
            <Bar dataKey="errorCount" fill="#fb7185" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </Box>
  );
}
