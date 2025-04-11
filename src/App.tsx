import "./App.css";
import HomePage from "./pages/HomePage.tsx";
import UploadFIlmPage from "./pages/UploadFIlmPage.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
function Yugen() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/UploadFilmPage" element={<UploadFIlmPage />} />
        </Routes>
      </Router>
    </div>
  );
}
export default Yugen;
