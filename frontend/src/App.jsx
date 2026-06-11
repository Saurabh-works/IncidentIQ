import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import IncidentSimulator from "./pages/IncidentSimulator";
import Logs from "./pages/Logs";
import Metrics from "./pages/Metrics";
import Timeline from "./pages/Timeline";
import RCA from "./pages/RCA";
import CustomServices from "./pages/CustomServices";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<IncidentSimulator />} />
          <Route path="/services" element={<CustomServices />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/rca" element={<RCA />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
