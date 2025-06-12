const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  stats: {
    batting: {
      runs: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      out: { type: Boolean, default: false, required: true },
      strikeRate: { type: Number, default: 0.0 },
    },
    bowling: {
      overs: { type: Number, default: 0 },
      ballsInCurrentOver: { type: Number, default: 0 },
      runsGiven: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      economy: { type: Number, default: 0.0 },
    },
  },
});

const CommentarySchema = new mongoose.Schema({
  over: { type: String}, // Example: "4.2"
  batter: { type: String },
  bowler: { type: String},
  runs: { type: Number },
  type: { type: String }, // "4", "6", "dot", "wicket", "wide", etc.
  text: {
    type: String,
    required: true,
    default: "No commentary available",
  }
}, { _id: false });

const CurrentMatchSchema = new mongoose.Schema({
  matchCode: { type: String, required: true, unique: true },
  overs: { type: Number, required: true },
  Target: { type: Number, default: 0 },
  Winners: { type: String },
  WinningRuns: { type: String },
  date: { type: Date, default: Date.now },
  Live:{type:Boolean,default:false},
  teamA: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    batting: { type: Boolean, default: false },
    bowling: { type: Boolean, default: false },
    overs: { type: Number, default: 0 },
    ballsInCurrentOver: { type: Number, default: 0 },
    extras: {
      wide: { type: Number, default: 0 },
      noBall: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 }
    }
  },
  teamB: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    batting: { type: Boolean, default: false },
    bowling: { type: Boolean, default: false },
    overs: { type: Number, default: 0 },
    ballsInCurrentOver: { type: Number, default: 0 },
    extras: {
      wide: { type: Number, default: 0 },
      noBall: { type: Number, default: 0 },
      byes: { type: Number, default: 0 },
      legByes: { type: Number, default: 0 }
    }
  },
  playersA: [PlayerSchema],
  playersB: [PlayerSchema],
  activeBatter1: {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    onStrike: { type: Boolean, default: true },
  },
  activeBatter2: {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    onStrike: { type: Boolean, default: false },
  },
  activeBowler: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  wicketsFallen: { type: Number, default: 0 },
  lastAction: {
    type: Object,
    default: null
  },
  commentary: [CommentarySchema],
});

module.exports = mongoose.model("CurrentMatch", CurrentMatchSchema);
