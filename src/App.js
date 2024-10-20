import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import Yoga from "./pages/Yoga/Yoga";
import About from "./pages/About/About";
import Tutorials from "./pages/Tutorials/Tutorials";
import Leaderboard from "./pages/Leaderboard/Leaderboard"; // Import Leaderboard page
import UserInfoForm from "./components/UserInfoForm/UserInfoForm"; // Renamed to UserInfoForm

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [userData, setUserData] = useState({
    name: "",
    place: "",
    department: "",
  });
  const [userScore, setUserScore] = useState(null); // Stores the score of the user

  // Callback to handle user data submission from the UserInfoForm page
  const handleUserDetailsSubmit = (data) => {
    setUserData(data);
  };

  // Callback to handle the score after completing the Yoga pose
  const handleGameCompletion = (score) => {
    setUserScore(score);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Route to input user details */}
        <Route
          path="/user-info"
          element={<UserInfoForm onSubmit={handleUserDetailsSubmit} />}
        />
        {/* Yoga game */}
        <Route
          path="/start"
          element={
            <Yoga userData={userData} onGameComplete={handleGameCompletion} />
          }
        />
        {/* Leaderboard to display score */}
        <Route
          path="/leaderboard"
          element={<Leaderboard userScore={userScore} userData={userData} />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/tutorials" element={<Tutorials />} />
      </Routes>
    </Router>
  );
}
