import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import EmptyState from "./EmptyState";
import { time } from "../utils/formatters";
export default function LogTable({ logs = [] }) {
  if (!logs.length) return <EmptyState message="No logs match the current filters."/>;
  return <TableContainer><Table sx={{ minWidth:760 }}><TableHead><TableRow>{["Time","Level","Service","Message","Trace ID"].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{logs.map((log,index)=><TableRow hover key={log._id || `${log.traceId}-${index}`}><TableCell sx={{ color:"text.secondary" }}>{time(log.timestamp)}</TableCell><TableCell><Chip size="small" label={log.level} color={log.level==="ERROR"?"error":log.level==="WARN"?"warning":"primary"} sx={{ fontWeight:600 }}/></TableCell><TableCell sx={{ fontWeight:600 }}>{log.serviceName}</TableCell><TableCell><Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth:430 }}>{log.message}</Typography></TableCell><TableCell sx={{ fontFamily:"monospace", color:"text.secondary", fontSize:12 }}>{log.traceId}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
