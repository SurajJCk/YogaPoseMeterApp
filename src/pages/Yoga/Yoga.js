import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { count } from "../../utils/music";
import Instructions from "../../components/Instructions/Instructions";
import DropDown from "../../components/DropDown/DropDown";
import { poseImages } from "../../utils/pose_images";
import { POINTS, keypointConnections } from "../../utils/data";
import { drawPoint, drawSegment } from "../../utils/helper";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import "./Yoga.css";

const CLASS_NO = {
  Utkatasana: 0,
  Bhujangasana: 1,
  Parvatasana: 2,
  No_Pose: 3,
  Sarvangasana: 4,
  Triangle: 5,
  Vrikshasana: 6,
  Virbhadrasana: 7,
};

const poseList = [
  "Vrikshasana",
  "Utkatasana",
  "Bhujangasana",
  "Virbhadrasana",
  "Parvatasana",
  "Sarvangasana",
  "Trikonasana",
];

let skeletonColor = "rgb(255,255,255)";
let interval;

function Yoga() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const [startingTime, setStartingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poseTime, setPoseTime] = useState(0);
  const [bestPerform, setBestPerform] = useState(0);
  const [currentPose, setCurrentPose] = useState(localStorage.getItem("currentPose")||"Vrikshasana");
  const [isStartPose, setIsStartPose] = useState(false);
  const [countAudio] = useState(new Audio(count));
let flag = false;

  useEffect(() => {
    const timeDiff = (currentTime - startingTime) / 1000;
    // if (flag) {
      setPoseTime(timeDiff);
    // }
    if (timeDiff >= bestPerform) {
      setBestPerform(timeDiff);
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      userDetails.pose = currentPose;
      userDetails.time = timeDiff;
      localStorage.setItem("userDetails", JSON.stringify(userDetails));
    // After storing, navigate to the 'Start' page
    // navigate("/start");

    // Optional: You can still send the data to your backend if necessary
    }
  }, [currentTime]);

  useEffect(() => {
    setCurrentTime(0);
    setPoseTime(0);
    setBestPerform(0);
    localStorage.setItem("currentPose", currentPose);
  }, [currentPose]);

  const normalizePoseLandmarks = (landmarks) => {
    const poseCenter = getCenterPoint(
      landmarks,
      POINTS.LEFT_HIP,
      POINTS.RIGHT_HIP
    );
    landmarks = tf.sub(landmarks, tf.expandDims(poseCenter, 1));
    const poseSize = getPoseSize(landmarks);
    return tf.div(landmarks, poseSize);
  };

  const landmarksToEmbedding = (landmarks) => {
    return tf.reshape(
      normalizePoseLandmarks(tf.expandDims(landmarks, 0)),
      [1, 34]
    );
  };

  const runMovenet = useCallback(async () => {
    console.log('Running detect pose');
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
    const poseClassifier = await tf.loadLayersModel(
      "https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json"
    );

    countAudio.loop = false;
    interval = setInterval(() => {
      detectPose(detector, poseClassifier);
    }, 100);
  }, [startingTime]);

  const detectPose = async (detector, poseClassifier) => {
    if (webcamRef.current?.video.readyState === 4) {
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      try {
        const keypoints = pose[0].keypoints;
        const input = keypoints.map((keypoint) => {
          if (keypoint.score > 0.4) {
            drawPoint(ctx, keypoint.x, keypoint.y, 8, "rgb(255,255,255)");
            const connections = keypointConnections[keypoint.name];
            connections?.forEach((connection) => {
              const conName = connection.toUpperCase();
              drawSegment(
                ctx,
                [keypoint.x, keypoint.y],
                [keypoints[POINTS[conName]].x, keypoints[POINTS[conName]].y],
                skeletonColor
              );
            });
          }
          return [keypoint.x, keypoint.y];
        });

        const processedInput = landmarksToEmbedding(input);
        const classification = poseClassifier.predict(processedInput);
        classification.array().then((data) => {
          const classNo = CLASS_NO[currentPose];
          if (data[0][classNo] > 0.97) {
            handlePoseDetected();
          } else {
            handlePoseNotDetected();
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePoseDetected = () => {
    if (!flag) {
      console.log('PoseDetected first');
      flag = true;
      countAudio.play();
      setStartingTime(Date.now());
    }
    setCurrentTime(Date.now());
    skeletonColor = "rgb(0,255,0)";
  };

  const handlePoseNotDetected = () => {
    console.log('PoseNot Detected');
    flag =false;
    skeletonColor = "rgb(255,255,255)";
    countAudio.pause();
    countAudio.currentTime = 0;
  };

  const startPose = () => {
    setIsStartPose(true);
    runMovenet();
  };

  const stopPose = async() => {
    setIsStartPose(false);
    clearInterval(interval);
    console.log("Hii");
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      userDetails.pose = currentPose;
      console.log(userDetails);
      const response = await fetch("http://localhost:5000/add-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),
      });

      if (response.ok) {
        console.log("User information saved successfully.");
      } else {
        console.error("Failed to save user information.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isStartPose) {
    return (
      <div className="yoga-container">
        <div className="performance-container">
          <div className="pose-performance">
            <h4>Pose Time: {poseTime.toFixed(2)} s</h4>
          </div>
          <div className="pose-performance">
            <h4>Best: {bestPerform.toFixed(2)} s</h4>
          </div>
        </div>
        <div>
          <Webcam
            width="640px"
            height="480px"
            ref={webcamRef}
            style={{
              position: "absolute",
              left: 120,
              top: 100,
              padding: "0px",
            }}
          />
          <canvas
            ref={canvasRef}
            width="640px"
            height="480px"
            style={{
              position: "absolute",
              left: 120,
              top: 100,
              zIndex: 1,
            }}
          />
          <div>
            <img
              src={poseImages[currentPose]}
              alt={currentPose}
              className="pose-img"
            />
          </div>
        </div>
        <button onClick={stopPose} className="secondary-btn">
          Stop Pose
        </button>
      </div>
    );
  }

  return (
    <div className="yoga-container">
      <div className="header-container">
        <DropDown
          poseList={poseList}
          currentPose={currentPose}
          setCurrentPose={setCurrentPose}
        />
        <button
          onClick={() => navigate("/leaderboard")}
          className="leaderboard-btn"
        >
          Leaderboard
        </button>
        <button onClick={() =>{localStorage.clear(); navigate("/")}} className="exit-btn">
        Exit
      </button>
      </div>
      <Instructions currentPose={currentPose} />
      <button onClick={startPose} className="secondary-btn">
        Start Pose
      </button>
    </div>
  );
}

const getCenterPoint = (landmarks, leftBodypart, rightBodypart) => {
  const left = tf.gather(landmarks, leftBodypart, 1);
  const right = tf.gather(landmarks, rightBodypart, 1);
  return tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
};

const getPoseSize = (landmarks, torsoSizeMultiplier = 2.5) => {
  const hipsCenter = getCenterPoint(
    landmarks,
    POINTS.LEFT_HIP,
    POINTS.RIGHT_HIP
  );
  const shouldersCenter = getCenterPoint(
    landmarks,
    POINTS.LEFT_SHOULDER,
    POINTS.RIGHT_SHOULDER
  );
  const torsoSize = tf.norm(tf.sub(shouldersCenter, hipsCenter));
  const poseCenterNew = tf.expandDims(
    getCenterPoint(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP),
    1
  );
  const d = tf.gather(tf.sub(landmarks, poseCenterNew), 0, 0);
  const maxDist = tf.max(tf.norm(d, "euclidean", 0));
  return tf.maximum(tf.mul(torsoSize, torsoSizeMultiplier), maxDist);
};

export default Yoga;
