import { Box, Card, Typography } from "@mui/material";
import { panelSx } from "../theme";
export default function StatCard({ label, value, icon: Icon, tone = "cyan" }) {
  const colors = { cyan:"#22d3ee", green:"#34d399", amber:"#fbbf24", red:"#fb7185", violet:"#a78bfa" };
  const color = colors[tone];
  return <Card sx={{
    ...panelSx,
    position:"relative",
    overflow:"hidden",
    p:1.5,
    minHeight:104,
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    background:`linear-gradient(145deg, ${color}0D 0%, rgba(15,23,42,.78) 45%)`,
    transition:"transform .2s ease, border-color .2s ease",
    "&:hover":{ transform:"translateY(-2px)", borderColor:`${color}66` },
    "&::before":{ content:'""', position:"absolute", inset:"0 auto 0 0", width:3, bgcolor:color },
  }}>
    <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:1.5 }}>
      <Typography color="text.secondary" sx={{ textTransform:"uppercase", letterSpacing:.55, fontWeight:500, fontSize:10, lineHeight:1.35, maxWidth:72 }}>{label}</Typography>
      <Box sx={{ display:"grid", placeItems:"center", minWidth:27, height:27, borderRadius:1, color, bgcolor:`${color}18`, border:`1px solid ${color}20` }}><Icon size={14}/></Box>
    </Box>
    <Box>
      <Typography sx={{ fontSize:19, lineHeight:1, fontWeight:600, letterSpacing:"-.02em" }}>{value}</Typography>
      <Box sx={{ mt:1, width:24, height:2, borderRadius:1, bgcolor:color, opacity:.65 }}/>
    </Box>
  </Card>;
}
