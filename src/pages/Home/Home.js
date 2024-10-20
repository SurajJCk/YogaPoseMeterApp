import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  useEffect(() => {
    setDisclaimerVisible(true);
  }, []);

  const closeDisclaimer = () => {
    setDisclaimerVisible(false);
  };

  return (
    <div className="home-container">
      {disclaimerVisible && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-popup animated-popup">
            <button className="close-btn" onClick={closeDisclaimer}>
              ✖
            </button>
            <h2 className="disclaimer-title">Important Notice</h2>
            <p className="disclaimer-text">
              Disclaimer: This game is simply for fun and is not intended to
              teach or guide yogasanas. Yoga is a very delicate and spiritual
              practice that requires proper guidance and teaching by trained
              instructors. Please treat this as a game only.
            </p>
            <button className="btn-accept" onClick={closeDisclaimer}>
              Got it!
            </button>
          </div>
        </div>
      )}

      <div className="home-header">
        <h1 className="home-heading neon-text">
          Sadhnapada Seva Mela Yoga Challenge 2024
        </h1>
        <Link to="/about">
          <button className="btn btn-secondary neon-btn" id="about-btn">
            About
          </button>
        </Link>
      </div>

      <h1 className="description">Asana Meter</h1>
      <div className="home-main">
        <div className="btn-section">
          <Link to="/user-info">
            <button className="btn start-btn neon-btn">Let's Begin</button>
          </Link>
          <Link to="/tutorials">
            <button className="btn start-btn neon-btn">Tutorials</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
