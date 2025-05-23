const express = require("express");
const cors = require("cors");
var nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const User = require("./models/User");
const Team = require("./models/Team");
const CurrentMatch = require("./models/CurrentMatch");
const app = express();
const crypto = require("crypto");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`, 
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
}));
app.use(express.json({ limit: "10mb" }));

connectDB();

app.post("/data", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const existingName = await User.findOne({ username });
    if (existingName)
      return res.status(400).json({ error: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      stats: {
        batting: {
          runs: 0,
          ballsFaced: 0,
          sixes: 0,
          fours: 0,
          strikeRate: 0.0,
        },
        bowling: {
          overs: 0,
          runsGiven: 0,
          wickets: 0,
          economy: 0.0,
        },
      },
      teamsPlayed: [],
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "4h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error occurred while registering user",
        details: error.message,
      });
  }
});

app.post("/forgot-password", async (req, resp) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return resp.status(404).send("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetToken = resetTokenHash;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

  try {
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please visit the following link to reset your password: ${resetUrl}`;

    try {
      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset",
        text: message,
      });
      resp.send("Reset link sent to your email");
    } catch (error) {
      console.error("Error sending email:", error);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      resp.status(500).send("Error sending email");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    resp.status(500).send("Error saving reset token");
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({ resetToken: hashedToken });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res
        .status(400)
        .json({
          message:
            "Token has expired. Please request a new password reset link.",
        });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/:id/update-profile", async (req, res) => {
  try {
    const { username, role, profilePic } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (role) user.role = role;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    res.status(200).json({ message: "User profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "4h" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/addteam", async (req, res) => {
  try {
    const { name, logo } = req.body;

    if (!name || !logo) {
      return res.status(400).json({ error: "Team name and logo are required" });
    }

    const existingTeam = await Team.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingTeam) {
      return res.status(400).json({ error: "Team name already exists" });
    }

    const newTeam = new Team({
      name,
      logo,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
    });

    await newTeam.save();
    res.json({ message: "Team added successfully!", team: newTeam });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add team", details: error.message });
  }
});

app.get("/teams", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Team name is required" });

    const teams = await Team.find({ name: { $regex: name, $options: "i" } });
    res.json(teams);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch teams", details: error.message });
  }
});

app.get("/team/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });

    res.json(team);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch team details", details: error.message });
  }
});

app.get("/players", async (req, res) => {
  const { name } = req.query;
  try {
    if (!name)
      return res.status(400).json({ error: "Player name is required" });

    const players = await User.find({
      username: { $regex: name, $options: "i" },
    });

    res.json(players);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to search players", details: error.message });
  }
});

app.get("/player/:id", async (req, res) => {
  try {
    const player = await User.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    res.json(player);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch player details",
        details: error.message,
      });
  }
});

app.post("/currentmatch", async (req, res) => {
  try {
    const { overs, matchCode, teamA, teamB, playersA, playersB, battingTeam } =
      req.body;

    if (
      !matchCode ||
      !teamA ||
      !teamB ||
      playersA.length === 0 ||
      playersB.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const isTeamABatting = String(battingTeam) === String(teamA.id);

    const newMatch = new CurrentMatch({
      matchCode,
      overs,
      teamA: {
        ...teamA,
        score: 0,
        wickets: 0,
        batting: isTeamABatting,
        bowling: !isTeamABatting,
      },
      teamB: {
        ...teamB,
        score: 0,
        wickets: 0,
        batting: !isTeamABatting,
        bowling: isTeamABatting,
      },
      playersA,
      playersB,
    });

    await newMatch.save();
    res.status(201).json({
      message: "Match saved successfully!",
      match: newMatch,
    });
  } catch (error) {
    console.error("Error saving match:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/verify-match", async (req, res) => {
  const { matchCode } = req.body;

  if (!matchCode) {
    return res.status(400).json({ error: "Match code is required" });
  }

  const match = await CurrentMatch.findOne({ matchCode });

  if (match) {
    return res.json({ success: true, match });
  } else {
    return res.status(404).json({ error: "Match not found" });
  }
});

app.post("/select-batter1", async (req, res) => {
  const { matchCode, batterName } = req.body;

  try {
    const user = await User.findOne({ username: batterName });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    match.activeBatter1 = { player: user._id, onStrike: true };
    await match.save();

    res.json({
      success: true,
      message: "Batter 1 selected",
      batterId: user._id,
    });
  } catch (error) {
    console.error("Error selecting batter 1:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

app.post("/select-batter2", async (req, res) => {
  const { matchCode, batterName } = req.body;

  try {
    const user = await User.findOne({ username: batterName });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    match.activeBatter2 = { player: user._id, onStrike: false };
    await match.save();

    res.json({
      success: true,
      message: "Batter 2 selected",
      batterId: user._id,
    });
  } catch (error) {
    console.error("Error selecting batter 2:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

app.post("/select-bowler", async (req, res) => {
  const { matchCode, bowlerName } = req.body;

  try {
    const user = await User.findOne({ username: bowlerName });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    match.activeBowler = user._id;

    await match.save();

    res.json({ success: true, message: "Bowler selected", bowlerId: user._id });
  } catch (error) {
    console.error("Error selecting bowler:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

app.get("/active-players/:matchCode", async (req, res) => {
  try {
    const { matchCode } = req.params;

    const match = await CurrentMatch.findOne({ matchCode });

    let battingTeam = match.teamA.batting ? match.teamA : match.teamB;
    let bowlingTeam = match.teamA.batting ? match.teamB : match.teamA;
    let battingTeamName = battingTeam.name;
    let bowlingTeamName = bowlingTeam.name;
    const BatTeamLogo = await Team.findOne({ name: battingTeamName });
    const BowlTeamLogo = await Team.findOne({ name: bowlingTeamName });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const activeBatter1 =
      match.playersA.find((player) =>
        player.id.equals(match.activeBatter1.player)
      ) ||
      match.playersB.find((player) =>
        player.id.equals(match.activeBatter1.player)
      ) ||
      null;

    const activeBatter2 =
      match.playersA.find((player) =>
        player.id.equals(match.activeBatter2.player)
      ) ||
      match.playersB.find((player) =>
        player.id.equals(match.activeBatter2.player)
      ) ||
      null;

    const activeBowler =
      match.playersA.find((player) => player.id.equals(match.activeBowler)) ||
      match.playersB.find((player) => player.id.equals(match.activeBowler)) ||
      null;

    res.status(200).json({
      activeBatter1: activeBatter1
        ? {
            ...activeBatter1.toObject(),
            onStrike: match.activeBatter1.onStrike,
          }
        : null,
      activeBatter2: activeBatter2
        ? {
            ...activeBatter2.toObject(),
            onStrike: match.activeBatter2.onStrike,
          }
        : null,
      activeBowler,
      BattingLogo: BatTeamLogo,
      BowlingLogo: BowlTeamLogo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/update-run/:matchCode", async (req, res) => {
  try {
    const { matchCode } = req.params;
    const { runs, type, wicket } = req.body;
    const match = await CurrentMatch.findOne({ matchCode });
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.Live = true;

    let activeBatterKey = match.activeBatter1.onStrike
      ? "activeBatter1"
      : "activeBatter2";
    let batter = match[activeBatterKey];

    const batterUser = await User.findOne({ _id: batter.player });
    if (!batterUser)
      return res.status(404).json({ message: "Batter User not found" });

    batterUser.stats.batting.runs += runs;
    batterUser.stats.batting.ballsFaced += 1;
    if (runs === 4) batterUser.stats.batting.fours += 1;
    if (runs === 6) batterUser.stats.batting.sixes += 1;

    let runsScoreduser = batterUser.stats.batting.runs;
    let ballsFaceduser = batterUser.stats.batting.ballsFaced;
    batterUser.stats.batting.strikeRate = (
      (runsScoreduser / ballsFaceduser) *
      100
    ).toFixed(2);
    await batterUser.save();

    let playerList = match.playersA.concat(match.playersB);
    let playerIndex = playerList.findIndex(
      (p) => p.id?.toString() === batter.player?.toString()
    );
    if (playerIndex === -1)
      return res.status(404).json({ message: "Batter not found" });

    let bowlerIndex = playerList.findIndex(
      (p) => p.id?.toString() === match.activeBowler?.toString()
    );
    if (bowlerIndex === -1)
      return res.status(404).json({ message: "Bowler not found" });

    let bowler = playerList[bowlerIndex];
    let battingTeam = match.teamA.batting ? match.teamA : match.teamB;
    let bowlerId = match.activeBowler;
    const bowlerUser = await User.findOne({ _id: bowlerId });
    bowlerUser.stats.bowling.runsGiven += runs;

    if (wicket) {
      bowlerUser.stats.bowling.wickets += 1;
    }

    if (type === "wide") {
      const total = runs === 0 ? 1 : runs + 1;
      bowler.stats.bowling.runsGiven += total;
      battingTeam.extras.wide += total;
      battingTeam.score += total;
    } else if (type === "no-ball") {
      const total = runs === 0 ? 1 : runs + 1;
      bowler.stats.bowling.runsGiven += total;
      battingTeam.extras.noBall += total;
      battingTeam.score += total;
    } else if (type === "leg-bye") {
      if (match.teamA.bowling) {
        match.teamA.ballsInCurrentOver =
          (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
      } else if (match.teamB.bowling) {
        match.teamB.ballsInCurrentOver =
          (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
      }
      bowler.stats.bowling.ballsInCurrentOver =
        (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
      if (bowler.stats.bowling.ballsInCurrentOver >= 6) {
        bowler.stats.bowling.ballsInCurrentOver = 0;
        match.teamA.ballsInCurrentOver = 0;
        bowler.stats.bowling.overs += 1;
        bowlerUser.stats.bowling.overs += 1;
      }
      bowler.stats.bowling.runsGiven += runs;
      battingTeam.extras.byes += runs;
      battingTeam.score += runs;
    } else {
      playerList[playerIndex].stats.batting.runs += runs;
      playerList[playerIndex].stats.batting.ballsFaced += 1;
      bowler.stats.bowling.runsGiven += runs;

      if (match.teamA.bowling) {
        match.teamA.ballsInCurrentOver =
          (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
      } else if (match.teamB.bowling) {
        match.teamB.ballsInCurrentOver =
          (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
      }

      bowler.stats.bowling.ballsInCurrentOver =
        (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;

      if (bowler.stats.bowling.ballsInCurrentOver >= 6) {
        bowler.stats.bowling.ballsInCurrentOver = 0;
        match.teamA.ballsInCurrentOver = 0;
        bowler.stats.bowling.overs += 1;
        bowlerUser.stats.bowling.overs += 1;

        match.activeBatter1.onStrike = !match.activeBatter1.onStrike;
        match.activeBatter2.onStrike = !match.activeBatter2.onStrike;

        if (match.teamA.bowling) {
          match.teamA.overs += 1;
          match.teamA.ballsInCurrentOver = 0;
        } else if (match.teamB.bowling) {
          match.teamB.overs += 1;
          match.teamB.ballsInCurrentOver = 0;
        }
      }

      if (runs === 4) playerList[playerIndex].stats.batting.fours += 1;
      if (runs === 6) playerList[playerIndex].stats.batting.sixes += 1;

      battingTeam.score += runs;
      // if(match.Target!=0 &&  battingTeam.score>=match.Target ){
      //   match.Winners = battingTeam.name
      // }

      if (runs % 2 !== 0) {
        match.activeBatter1.onStrike = !match.activeBatter1.onStrike;
        match.activeBatter2.onStrike = !match.activeBatter2.onStrike;
      }
    }

    if (wicket) {
      bowler.stats.bowling.wickets += 1;
      match.wicketsFallen += 1;
      battingTeam.wickets += 1;
    }

    let runsScored = playerList[playerIndex].stats.batting.runs;
    let ballsFaced = playerList[playerIndex].stats.batting.ballsFaced;
    playerList[playerIndex].stats.batting.strikeRate = (
      (runsScored / ballsFaced) *
      100
    ).toFixed(2);

    const totalBalls =
      bowler.stats.bowling.overs * 6 + bowler.stats.bowling.ballsInCurrentOver;
    const totalOversDecimal = totalBalls / 6;
    bowler.stats.bowling.economy = totalOversDecimal
      ? (bowler.stats.bowling.runsGiven / totalOversDecimal).toFixed(2)
      : 0;

    const bowlerUserTotalBalls =
      bowlerUser.stats.bowling.overs * 6 +
      (bowler.stats.bowling.ballsInCurrentOver || 0);
    const bowlerUserOversDecimal = bowlerUserTotalBalls / 6;
    bowlerUser.stats.bowling.economy = bowlerUserOversDecimal
      ? (bowlerUser.stats.bowling.runsGiven / bowlerUserOversDecimal).toFixed(2)
      : 0;

    if (match.Target !== 0) {
      const totalMatchBalls = match.overs * 6;
      const battingTeamObj = match.teamA.batting ? match.teamA : match.teamB;
      const bowlingTeamObj = match.teamA.bowling ? match.teamA : match.teamB;

      const ballsBowled =
        bowlingTeamObj.overs * 6 + (bowlingTeamObj.ballsInCurrentOver || 0);
      const ballsRemaining = totalMatchBalls - ballsBowled;
      const runsRemaining = match.Target - battingTeamObj.score;

      const isAllOut = battingTeamObj.wickets >= 10;
      const isOversDone = ballsRemaining <= 0;

      if (runsRemaining > 0 && !isAllOut && !isOversDone) {
        match.WinningRuns = `${battingTeamObj.name} need ${runsRemaining} run${
          runsRemaining === 1 ? "" : "s"
        } in ${ballsRemaining} ball${ballsRemaining === 1 ? "" : "s"}`;
      } else if (runsRemaining <= 0) {
        match.Winners = battingTeamObj.name;
        match.WinningRuns = `${battingTeamObj.name} won by ${
          10 - battingTeamObj.wickets
        } wicket${10 - battingTeamObj.wickets === 1 ? "" : "s"}`;
      } else if (isAllOut || isOversDone) {
        match.Winners = bowlingTeamObj.name;
        match.WinningRuns = `${
          bowlingTeamObj.name
        } won by ${runsRemaining} run${runsRemaining === 1 ? "" : "s"}`;
      }
    }

    await match.save();
    await bowlerUser.save();

    res.json({
      success: true,
      message: "Run updated successfully!",

      updatedPlayer: playerList[playerIndex],
      updatedBowler: {
        ...bowler,
        ballsInCurrentOver: bowlerUser.stats.bowling.ballsInCurrentOver,
        economy: bowler.stats.bowling.economy,
      },
      winningStatus: match.WinningRuns,
    });
  } catch (err) {
    console.error("Error updating run:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/wicket-event", async (req, res) => {
  try {
    const { matchCode, dismissedBatter, dismissalType } = req.body;

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const activeBatterKey = match.activeBatter1.onStrike
      ? "activeBatter1"
      : "activeBatter2";
    const batter = match[activeBatterKey];

    if (!batter?.player) {
      return res.status(400).json({ message: "No active batter found" });
    }

    const battingTeamKey = match.teamA.batting ? "playersA" : "playersB";
    const teamKey = match.teamA.batting ? "teamA" : "teamB";
    const players = match[battingTeamKey];

    const dismissedPlayer = players.find(
      (p) => p.id.toString() === batter.player.toString()
    );
    if (!dismissedPlayer) {
      return res
        .status(404)
        .json({ message: "Dismissed player not found in team list" });
    }

    dismissedPlayer.stats.batting.out = true;

    const allPlayers = [...match.playersA, ...match.playersB];
    const bowler = allPlayers.find(
      (p) => p.id.toString() === match.activeBowler?.toString()
    );
    if (bowler) {
      bowler.stats.bowling.wickets += 1;
    }
    if (match.teamA.bowling) {
      match.teamA.ballsInCurrentOver =
        (match.teamA.ballsInCurrentOver || 0) + 1;
      bowler.stats.bowling.ballsInCurrentOver =
        (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
    } else if (match.teamB.bowling) {
      match.teamB.ballsInCurrentOver =
        (match.teamB.ballsInCurrentOver || 0) + 1;
      bowler.stats.bowling.ballsInCurrentOver =
        (bowler.stats.bowling.ballsInCurrentOver || 0) + 1;
    }

    const bowlerUser = await User.findById(match.activeBowler);
    if (bowlerUser) {
      bowlerUser.stats.bowling.wickets += 1;
      await bowlerUser.save();
    }

    match[activeBatterKey].player = null;

    match.wicketsFallen += 1;
    match[teamKey].wickets += 1;
    await match.save();

    res.status(200).json({ message: "Wicket updated successfully", match });
  } catch (error) {
    console.error("Error updating wicket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/select-batter", async (req, res) => {
  const { matchCode, batterName } = req.body;

  try {
    const user = await User.findOne({ username: batterName });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    match.activeBatter1 = { player: user._id, onStrike: true };
    await match.save();

    res.json({
      success: true,
      message: "Batter 1 selected",
      batterId: user._id,
    });
  } catch (error) {
    console.error("Error selecting batter 1:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

app.post("/select-bowlerChange", async (req, res) => {
  const { matchCode, bowlerName } = req.body;

  try {
    const user = await User.findOne({ username: bowlerName });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match)
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });

    match.activeBowler = user._id;

    // if (match.teamA.bowling) {
    //   match.teamA.overs += 1;
    //   match.teamA.ballsInCurrentOver = 0
    // } else if (match.teamB.bowling) {
    //   match.teamB.overs += 1;
    //   match.teamB.ballsInCurrentOver = 0
    // }
    await match.save();

    res.json({ success: true, message: "Bowler selected", bowlerId: user._id });
  } catch (error) {
    console.error("Error selecting bowler:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

app.get("/toggle-innings/:matchCode", async (req, res) => {
  try {
    const { matchCode } = req.params;

    const match = await CurrentMatch.findOne({ matchCode });
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (match.teamA.batting) {
      match.Target = match.teamA.score + 1;
    }
    if (match.teamB.batting) {
      match.Target = match.teamB.score + 1;
    }
    const tempBatting = match.teamA.batting;
    const tempBowling = match.teamA.bowling;

    match.teamA.batting = match.teamB.batting;
    match.teamA.bowling = match.teamB.bowling;
    match.teamB.batting = tempBatting;
    match.teamB.bowling = tempBowling;

    if (match.Winners) {
      match.Winners = " ";
      await match.save();
    }

    await match.save();

    res.status(200).json({ message: "Innings toggled successfully", match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/full", async (req, res) => {
  try {
    const matches = await CurrentMatch.find()
      .populate("teamA.id", "name")
      .populate("teamB.id", "name")
      .populate("playersA.id", "name")
      .populate("playersB.id", "name")
      .populate("activeBatter1.player", "name")
      .populate("activeBatter2.player", "name")
      .populate("activeBowler", "name")
      .lean();

    if (!matches.length) {
      return res
        .status(404)
        .json({ success: false, message: "No matches found" });
    }

    return res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});
app.get("/scorecard/:matchCode", async (req, res) => {
  const { matchCode } = req.params;

  try {
    const match = await CurrentMatch.findOne({ matchCode })
      .populate("teamA.id", "name")
      .populate("teamB.id", "name")
      .populate("playersA.id", "name")
      .populate("playersB.id", "name")
      .populate("activeBatter1.player", "name")
      .populate("activeBatter2.player", "name")
      .populate("activeBowler", "name")
      .lean();

    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    return res.status(200).json({ success: true, match });
  } catch (error) {
    console.error("Error fetching match:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/togglestrike", async (req, res) => {
  const { matchCode } = req.body;
  try {
    const match = await CurrentMatch.findOne({ matchCode });
    if (!match) {
      return res.json({ message: "match not fount" });
    }

    match.activeBatter1.onStrike = !match.activeBatter1.onStrike;
    match.activeBatter2.onStrike = !match.activeBatter2.onStrike;

    await match.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error fetching match:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.post("/winner", async (req, res) => {
  const { winner, matchCode } = req.body;

  try {
    const match = await CurrentMatch.findOne({ matchCode });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.Winners) {
      match.Winners = winner;
      match.Live = false;
      await match.save();
      console.log("Winner set:", winner, "for match:", matchCode);
      return res.json({ message: `${winner} set as winner` });
    } else {
      return res.json({ message: `Winner already set as ${match.Winners}` });
    }
  } catch (error) {
    console.error("Error setting winner:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/runs", async (req, res) => {
  const { runsNeed, finalBalls, TeamName, matchCode } = req.body;

  try {
    const match = await CurrentMatch.findOne({ matchCode });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.WinningRuns = `${TeamName} require ${runsNeed} runs in ${finalBalls} balls`;
    await match.save();

    return res.json({ message: `Runs set` });
  } catch (error) {
    console.error("Error setting winner:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/require-runs/:matchCode", async (req, res) => {
  const { matchCode } = req.params;

  if (!matchCode) {
    return res.status(400).json({ error: "Match code is required" });
  }

  const match = await CurrentMatch.findOne({ matchCode });

  if (match) {
    return res.json({ success: true, match });
  } else {
    return res.status(404).json({ error: "Match not found" });
  }
});

app.post("/commentary/:matchCode", async (req, res) => {
  const { matchCode } = req.params;
  const { over, batter, bowler, runs, type, text } = req.body;

  try {
    const match = await CurrentMatch.findOne({ matchCode });
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const newCommentary = {
      over,
      batter,
      bowler,
      runs,
      type,
      text,
    };

    match.commentary.push(newCommentary);
    await match.save();

    res
      .status(200)
      .json({
        message: "Commentary added successfully",
        commentary: newCommentary,
      });
  } catch (error) {
    console.error("Error adding commentary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
