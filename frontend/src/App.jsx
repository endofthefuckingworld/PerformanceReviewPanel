import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./component/header.jsx";

import PerformerCheck from "./component/pages/PerformerCheck/performerCheck.jsx";
import PerformerCreate from "./component/pages/PerformerCreate/PerformerCreate.jsx";
import ApplicationCreate from "./component/pages/ApplicationCreate/ApplicationCreate.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="app-main">
        <Routes>
          <Route path="/" element={<PerformerCheck />} />
          <Route path="/performers/new" element={<PerformerCreate />} />
          <Route path="/applications/new" element={<ApplicationCreate />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
