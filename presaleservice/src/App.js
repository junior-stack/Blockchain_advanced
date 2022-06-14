import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Buyer from "./Pages/Buyer/Buyer";
import User from "./Pages/User/User";
import Admin from "./Pages/Admin/Admin";
import Finish from "./Pages/Finish/Finish";

function App() {
  return (
    <Routes>
      <Route path="/buyer" element={<Buyer />}></Route>
      <Route path="/user" element={<User />}></Route>
      <Route path="/admin" element={<Admin />}></Route>
      <Route path="/finish" element={<Finish />}></Route>
      <Route path="*" element={<Navigate to="/buyer" />} />
    </Routes>
  );
}

export default App;
