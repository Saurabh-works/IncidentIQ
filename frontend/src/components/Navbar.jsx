import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
const names = { "/":"System Overview", "/simulator":"Incident Simulator", "/services":"Custom Services", "/logs":"Live Logs", "/metrics":"Performance Metrics", "/timeline":"Incident Timeline", "/rca":"Root Cause Analysis" };
export default function Navbar() { const { pathname }=useLocation(); return <Box component="header" sx={{ mb:4, pb:2.5, pl:{xs:6,lg:0}, borderBottom:"1px solid", borderColor:"divider" }}><Typography variant="caption" color="primary.main" fontWeight={500} sx={{ textTransform:"uppercase", letterSpacing:2 }}>Observability workspace</Typography><Typography variant="h5">{names[pathname] || "IncidentIQ"}</Typography></Box>; }
