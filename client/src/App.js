import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Components/Home";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import NavBar from "./Components/NavBar";
import AddTeam from "./Components/AddTeam";
import SelectMatch from "./Components/SelectMatch";
import PlayerSearch from "./Components/PlayerSearch";
import TeamSearch from "./Components/TeamSearch";
import EnterMatch from "./Components/EnterMatch";
import MatchDetails from "./Components/MatchDetails";

import ScoreCard from "./Components/ScoreCard";
import Settings from "./Components/Settings";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

const MainLayout = () => {
  const location = useLocation();
  // const hideNavBar = location.pathname === "/signup" || location.pathname === "/login";

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/newmatch" element={<AddTeam/>}/>
        <Route path="/selectmatch" element={<SelectMatch/>}/>
        <Route path='/playersearch' element={<PlayerSearch/>}/>
        <Route path='/teamsearch' element={<TeamSearch/>}/>
        <Route path='/entermatch' element={<EnterMatch/>}/>
        <Route path="/match/:matchCode" element={<MatchDetails />}/>
        <Route path="/scorecard" element={<ScoreCard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </>
  );
};

export default App;
