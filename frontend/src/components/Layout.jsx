import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageErrorBoundary from "./PageErrorBoundary";
export default function Layout() { const [open,setOpen]=useState(false); return <Box sx={{ minHeight:"100vh" }}><Sidebar open={open} setOpen={setOpen}/><Box component="main" sx={{ ml:{lg:"256px"},p:{xs:2,sm:3.5,lg:4} }}><Navbar/><PageErrorBoundary><Outlet/></PageErrorBoundary></Box></Box>; }
