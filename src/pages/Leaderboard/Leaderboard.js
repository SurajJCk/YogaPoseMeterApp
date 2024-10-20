import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const [sortedData, setSortedData] = useState([]);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch leaderboard data from the backend
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/leaderboard?pose=${localStorage.getItem(
            "currentPose"
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch leaderboard");

        const data = await response.json();

        // Handle the case where there are no entries in the leaderboard
        if (data.message) {
          console.log(data.message);
          return;
        }

        // Sort the leaderboard data by time in descending order
        const sorted = data.sort((a, b) => b.time - a.time);
        // setSortedData(sorted);
        setSortedData([...sorted]);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        // Trigger visibility after fetching data to allow CSS transition
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
      }
    };

    fetchLeaderboard();

    // Get user details and best time from localStorage
    const userDetails = JSON.parse(localStorage.getItem("userDetails")) || {};
    const userBestTime = userDetails.bestTime || Infinity;

    // Update local leaderboard with user data
    if (userDetails.name) {
      const existingUserIndex = sortedData.findIndex(
        (user) => user.name === userDetails.name
      );

      if (existingUserIndex > -1) {
        // Update existing user's best time if new time is better
        if (userBestTime > sortedData[existingUserIndex].time) {
          sortedData[existingUserIndex].time = userBestTime;
        }
      } else {
        // Add new user to the leaderboard if they are not already present
        sortedData.push({
          position: sortedData.length + 1,
          name: userDetails.name,
          time: `${userBestTime} seconds`,
          place: userDetails.place || "Unknown", // Add place
          department: userDetails.department || "Unknown", // Add department
        });
      }
    }

    setSortedData([...sortedData]);
  }, []);

  return (
    <div>
      <button onClick={() => navigate("/start")} className="leaderboard-btn">
        Back
      </button>

      <button
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
        className="exit-btn"
      >
        Exit
      </button>

      <div className="leaderboard">
        <h2 className="neon-title">
          🏆 Longest Times for {localStorage.getItem("currentPose")}🏆
        </h2>
        <ul className="leaderboard-list">
          <li className="leaderboard-item header">
            <div className="leaderboard-rank">Rank</div>
            <div className="leaderboard-name">Name</div>
            <div className="leaderboard-time">Score</div>
            <div className="leaderboard-place">Place</div>
            <div className="leaderboard-department">Dept</div>
          </li>
          {sortedData.map((user, index) => (
            <li
              key={index} // Change key to index since id is not being used
              className={`leaderboard-item ${visible ? "visible" : ""} rank-${
                index + 1
              }`}
            >
              <div className={`leaderboard-rank rank-${index + 1}`}>
                {user.position}
              </div>
              <div className="leaderboard-name">{user.name}</div>
              <div className="leaderboard-time">{user.time}</div>
              <div className="leaderboard-place">{user.place}</div>
              <div className="leaderboard-department">{user.department}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
