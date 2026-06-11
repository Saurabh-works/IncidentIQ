import { Box, CircularProgress } from "@mui/material";
export default function Loading() { return <Box sx={{ minHeight:208, display:"grid", placeItems:"center" }}><CircularProgress size={28}/></Box>; }
