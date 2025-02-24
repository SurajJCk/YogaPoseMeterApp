const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, query, where, orderBy, getDocs } = require('firebase/firestore');
const { getAnalytics } = require('firebase/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Note: Analytics is typically used in client-side applications
// If you need analytics in the backend, you'll need to use a different approach
// as getAnalytics() is meant for browser environments

// Middleware
app.use(cors());
app.use(express.json());

// API to add or update a user's time for a specific pose
app.post("/add-time", async (req, res) => {
  const { name, place, department, pose, time } = req.body;

  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const userPoseRef = doc(leaderboardRef, `${name}_${pose}`);
    
    // Check if the user already has an entry for the specific pose
    const userDoc = await getDoc(userPoseRef);

    if (userDoc.exists()) {
      const existingTime = userDoc.data().time;
      // Update only if new time is better
      if (time > existingTime) {
        await setDoc(userPoseRef, {
          name,
          place,
          department,
          pose,
          time,
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      // Create a new entry
      await setDoc(userPoseRef, {
        name,
        place,
        department,
        pose,
        time,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: "Time added/updated successfully!" });
  } catch (error) {
    console.error("Error saving time:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// API to get the leaderboard sorted by best time (longest time descending)
app.get("/leaderboard", async (req, res) => {
  try {
    const pose = req.query.pose;
    const leaderboardRef = collection(db, 'leaderboard');
    
    // Create a query to get entries for specific pose, ordered by time
    const q = query(
      leaderboardRef,
      where('pose', '==', pose),
      orderBy('time', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      leaderboard.push(doc.data());
    });

    if (leaderboard.length === 0) {
      return res.json({ message: "No entries in the leaderboard yet." });
    }

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Add a route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the Yoga Game API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
