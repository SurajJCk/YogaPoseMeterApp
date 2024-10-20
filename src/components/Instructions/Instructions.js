import React, { useState } from "react";

import { poseInstructions } from "../../utils/data";

import { poseImages } from "../../utils/pose_images";

import "./Instructions.css";

export default function Instructions({ currentPose }) {
  const [instructions, setInstructions] = useState(poseInstructions);

  return (
    <div className="instructions-container">
      <ul className="instructions-list">
        {instructions[currentPose].map((instruction) => {
          return <li className="instruction">{instruction}</li>;
        })}
      </ul>
      <img
        className="pose-demo-img"
        src={poseImages[currentPose]}
        alt="Description of the instruction image"
      />
    </div>
  );
}
