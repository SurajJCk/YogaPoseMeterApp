const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://codewithsjc:wlwlTQx7OBg58dYb@cluster0.mongodb.net/yogaGameDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define the schema for the leaderboard
const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  place: { type: String, required: true },
  department: { type: String, required: true },
  pose: { type: String, required: false },
  time: { type: Number, required: true }, // Best time for the pose
});

// Create a model based on the schema
const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API to add or update a user's time for a specific pose
app.post("/add-time", async (req, res) => {
  const { name, place, department, pose, time } = req.body;

  // Validation to ensure all fields are provided
  // if (
  //   !name ||
  //   !place ||
  //   !department ||
  //   !pose ||
  //   typeof time !== "number" ||
  //   time < 0
  // ) {
  //   return res.status(400).json({
  //     message:
  //       "Invalid input. Ensure all fields are filled and time is a positive number.",
  //   });
  // }

  try {
    // Check if the user already has an entry for the specific pose
    let existingUser = await Leaderboard.findOne({ name, pose });

    // If user exists, update their time if the new time is better (longer)
    if (existingUser) {
      if (time > existingUser.time) {
        // Update to the new best time
        existingUser.time = time;
        await existingUser.save();
      }
    } else {
      // Create a new entry for the user
      const newEntry = new Leaderboard({
        name,
        place,
        department,
        pose,
        time,
      });
      await newEntry.save();
    }

    res.json({ message: "Time added/updated successfully!" });
  } catch (error) {
    console.error("Error saving time:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
// });

// API to get the leaderboard sorted by best time (longest time descending)
app.get("/leaderboard", async (req, res) => {
  try {
    let pose = req.query.pose;
    // Retrieve and sort the leaderboard by time (longest duration first)
    const leaderboard = await Leaderboard.find({ pose: pose }).sort({
      time: -1,
    });

    if (leaderboard.length === 0) {
      return res.json({ message: "No entries in the leaderboard yet." });
    }

    // Return the sorted leaderboard in descending order
    res.json(
      leaderboard.map((entry, index) => ({
        position: index + 1,
        name: entry.name,
        time: `${entry.time} seconds`,
        place: entry.place,
        department: entry.department,
      }))
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Add a route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the Yoga Game API!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
