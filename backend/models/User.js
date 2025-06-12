const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'N/A' },
  profilePic: { type: String }, 
  resetToken: { type: String, default: undefined },
  resetTokenExpiry: { type: Date, default: undefined },
  stats: {
    batting: {
      runs: { type: Number, default: 0 },
      ballsFaced: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0.0 },
    },
    bowling: {
      overs: { type: Number, default: 0 },
      runsGiven: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      economy: { type: Number, default: 0.0 },
    }
  },
  teamsPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }]
});

module.exports = mongoose.model('User', userSchema);
