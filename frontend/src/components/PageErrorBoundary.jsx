import { Component } from "react";
import { Alert, Button, Card, Typography } from "@mui/material";
import { panelSx } from "../theme";
export default class PageErrorBoundary extends Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error,info){console.error("Page render failed:",error,info);}
  render(){if(!this.state.error)return this.props.children;return <Card sx={{...panelSx,p:3}}><Alert severity="error"><Typography fontWeight={500}>This page could not be rendered</Typography>{this.state.error.message}</Alert><Button variant="contained" sx={{mt:2}} onClick={()=>window.location.reload()}>Reload page</Button></Card>;}
}
