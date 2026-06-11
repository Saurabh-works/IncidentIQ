import { Inbox } from "lucide-react";
import { Box, Typography } from "@mui/material";
export default function EmptyState({ message = "Nothing to show yet." }) { return <Box sx={{ minHeight:128, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1, color:"text.secondary" }}><Inbox size={22}/><Typography variant="body2">{message}</Typography></Box>; }
