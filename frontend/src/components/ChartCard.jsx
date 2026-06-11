import { Box, Card, Typography } from "@mui/material";
import { panelSx } from "../theme";
export default function ChartCard({ title, subtitle, children, sx = {} }) {
  return <Card sx={{ ...panelSx, p:2.5, ...sx }}><Typography fontWeight={500}>{title}</Typography>{subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}<Box sx={{ height:256, mt:2.5 }}>{children}</Box></Card>;
}
