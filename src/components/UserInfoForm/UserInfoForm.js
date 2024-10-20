import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./UserInfoForm.css"; // CSS file for gaming design style

export default function UserInfoForm() {
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [department, setDepartment] = useState("");
  const [pose, setPose] = useState(""); // pose can be an optional value if needed
  const [time, setTime] = useState(0); // time could be an optional value depending on your use case
  const navigate = useNavigate(); // Initialize useNavigate for page navigation

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare user data
    const userDetails = { name, place, department, pose, time:0 };

    // Store user details in localStorage
    localStorage.setItem("userDetails", JSON.stringify(userDetails));

    // After storing, navigate to the 'Start' page
    navigate("/start");

    // Optional: You can still send the data to your backend if necessary
    // try {
    //   const response = await fetch("http://localhost:5000/add-time", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(userDetails),
    //   });

    //   if (response.ok) {
    //     console.log("User information saved successfully.");
    //   } else {
    //     console.error("Failed to save user information.");
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  };

  return (
    <Modal show={true} onHide={() => {}} centered className="game-modal">
      <Modal.Header className="game-modal-header">
        <Modal.Title className="neon-title">Enter Your Info</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formName">
            <Form.Label className="game-label">Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="game-input"
              required
            />
          </Form.Group>
          <Form.Group controlId="formPlace">
            <Form.Label className="game-label">Place</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="game-input"
              required
            />
          </Form.Group>
          <Form.Group controlId="formDepartment">
            <Form.Label className="game-label">Department</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="game-input"
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="game-button">
            Start Game
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
