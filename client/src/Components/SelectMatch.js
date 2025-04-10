import React, { useRef, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const SelectMatch = () => {
  const [searchTeamA, setSearchTeamA] = useState(""); 
  const [searchTeamB, setSearchTeamB] = useState(""); 
  const [teamsA, setTeamsA] = useState([]); 
  const [teamsB, setTeamsB] = useState([]);
  const [playersA, setPlayersA] = useState([]); 
  const [playersB, setPlayersB] = useState([]); 
  const [searchTermA, setSearchTermA] = useState(""); 
  const [searchTermB, setSearchTermB] = useState(""); 
  const [matchData, setMatchData] = useState({
    teamA: "",
    teamB: "",
    playersA: [],
    playersB: [],
    battingTeam: "",
    overs: 0, 
  });

  const [error, setError] = useState("");
  const [matchCode, setMatchCode] = useState(""); 
  const [isPopupOpen, setIsPopupOpen] = useState(false); 
  const navigate = useNavigate();
  const inputRefA = useRef(null);
  const inputRefB = useRef(null);
  const [copied, setCopied] = useState(false);

  const generateMatchCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const fetchTeams = async (query, setTeams) => {
    if (!query) return setTeams([]);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/teams?name=${query}`
      );
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const debouncedFetchTeamsA = debounce(
    (query) => fetchTeams(query, setTeamsA),
    500
  );
  const debouncedFetchTeamsB = debounce(
    (query) => fetchTeams(query, setTeamsB),
    500
  );

  const handleTeamSearch = (team, value) => {
    setError("");
    if (team === "teamA") {
      setSearchTeamA(value);
      debouncedFetchTeamsA(value);
    } else {
      setSearchTeamB(value);
      debouncedFetchTeamsB(value);
    }
  };


  const handleTeamSelect = (team, teamId, teamName) => {
    if (team === "teamA" && matchData.teamB === teamId) {
      setError("Both teams cannot be the same.");
      return;
    }
    if (team === "teamB" && matchData.teamA === teamId) {
      setError("Both teams cannot be the same.");
      return;
    }
    setError("");
    setMatchData((prev) => ({
      ...prev,
      [team]: teamId,
      [`players${team === "teamA" ? "A" : "B"}`]: [], 
    }));
    if (team === "teamA") {
      setSearchTeamA(teamName);
      setTeamsA([]);
    } else {
      setSearchTeamB(teamName);
      setTeamsB([]);
    }
  };

  
  const fetchPlayers = async (query, setPlayers) => {
    if (!query) return setPlayers([]);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/players?name=${query}`
      );
      setPlayers(response.data);
    } catch (error) {
      console.error("Error searching players:", error);
    }
  };

  const debouncedFetchPlayersA = debounce(
    (query) => fetchPlayers(query, setPlayersA),
    500
  );
  const debouncedFetchPlayersB = debounce(
    (query) => fetchPlayers(query, setPlayersB),
    500
  );

  
  const handlePlayerSearch = (team, value) => {
    setError("");
    if (team === "playersA") {
      setSearchTermA(value);
      debouncedFetchPlayersA(value);
    } else {
      setSearchTermB(value);
      debouncedFetchPlayersB(value);
    }
  };
  const handlePlayerSelect = (team, player) => {
    if (
      (team === "playersA" &&
        matchData.playersB.some((p) => p.id === player._id)) ||
      (team === "playersB" &&
        matchData.playersA.some((p) => p.id === player._id))
    ) {
      setError("Player cannot be in both teams.");
      return;
    }
    if (matchData[team].length >= 11) {
      setError("Each team can have a maximum of 11 players.");
      return;
    }
    if (matchData[team].some((p) => p.id === player._id)) {
      setError("Player is already in this team.");
      return;
    }

    setError("");

    setMatchData((prev) => ({
      ...prev,
      [team]: [
        ...prev[team],
        {
          id: player._id,
          name: player.username,
          stats: {
            batting: {
              runs: 0,
              ballsFaced: 0,
              sixes: 0,
              fours: 0,
              strikeRate: 0.0,
              out: false,
            },
            bowling: {
              overs: 0,
              runsGiven: 0,
              wickets: 0,
              economy: 0.0,
            },
          },
        },
      ],
    }));

    
    if (team === "playersA") {
      setSearchTermA(""); 
      setPlayersA([]);
      inputRefA.current?.focus();
    } else {
      setSearchTermB("");
      setPlayersB([]);
      inputRefB.current?.focus();
    }
  };

 
  const handleSubmit = async () => {
    if (!matchData.teamA || !matchData.teamB || !matchData.battingTeam) {
      setError("Both teams and batting team must be selected.");
      return;
    }

    const matchCode = generateMatchCode(); 
    setMatchCode(matchCode); 
    try {
      const formattedData = {
        teamA: { id: matchData.teamA, name: searchTeamA },
        teamB: { id: matchData.teamB, name: searchTeamB },
        playersA: matchData.playersA,
        playersB: matchData.playersB,
        battingTeam: matchData.battingTeam,
        matchCode: matchCode,
        overs: matchData.overs, 
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/currentmatch`,
        formattedData
      );
      localStorage.setItem("host", true);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        resetForm();
        setIsPopupOpen(true);
      }
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong");
    }
  };
  const resetForm = () => {
    setMatchData({
      teamA: "",
      teamB: "",
      playersA: [],
      playersB: [],
      battingTeam: "",
    });
    setSearchTeamA("");
    setSearchTeamB("");
    setSearchTermA("");
    setSearchTermB("");
  };

  const handlePlayerRemove = (team, playerId) => {
    setMatchData((prev) => ({
      ...prev,
      [team]: prev[team].filter((player) => player.id !== playerId),
    }));
  };

  const EnterMatch = () => {
    navigate("/entermatch");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">
        Create New Match
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          value={searchTeamA}
          onChange={(e) => handleTeamSearch("teamA", e.target.value)}
          placeholder="Search Team A..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {teamsA.length > 0 && (
          <div className="bg-white border border-gray-300 mt-2 rounded-xl shadow-lg max-h-[150px] overflow-y-auto scrollbar-hide">
            {teamsA.map((team) => (
              <div
                key={team._id}
                className="px-4 py-3 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out flex items-center space-x-3"
                onClick={() => handleTeamSelect("teamA", team._id, team.name)}
              >
                <img
                  src={team.logo}
                  alt="Team Logo"
                  className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
                />

                <span className="ml-2">{team.name}</span>
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          value={searchTeamB}
          onChange={(e) => handleTeamSearch("teamB", e.target.value)}
          placeholder="Search Team B..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {teamsB.length > 0 && (
          <div className="bg-white border border-gray-300 mt-2 rounded-xl shadow-lg max-h-[150px] overflow-y-auto scrollbar-hide">
            {teamsB.map((team) => (
              <div
                key={team._id}
                className="px-4 py-3 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out flex items-center space-x-3" // flex layout with space between image and name
                onClick={() => handleTeamSelect("teamB", team._id, team.name)}
              >
                <img
                  src={team.logo}
                  alt="Team Logo Preview"
                  className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
                />

                <span className="ml-2">{team.name}</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-600">
              Team A Players
            </h3>
            <input
              type="text"
              ref={inputRefA}
              value={searchTermA}
              onChange={(e) => handlePlayerSearch("playersA", e.target.value)}
              placeholder="Search Players..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="bg-white border border-gray-300 mt-2 rounded-xl shadow-lg max-h-[150px] overflow-y-auto scrollbar-hide">
              {playersA.map((player) => (
                <div
                  key={player._id}
                  className="px-4 py-3 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out flex items-center space-x-3"
                  onClick={() => handlePlayerSelect("playersA", player)}
                >
                  {player.profilePic ? (
                    <img
                      src={player.profilePic}
                      alt={player.username}
                      className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <FaUserCircle className="text-black text-3xl cursor-pointer" />
                  )}

                  <span className="ml-2">{player.username}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {matchData.playersA.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm"
                >
                  {player.name}
                  <i
                    className="fa-solid fa-xmark px-2"
                    onClick={() => handlePlayerRemove("playersA", player.id)}
                  ></i>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-600">
              Team B Players
            </h3>
            <input
              ref={inputRefB}
              type="text"
              value={searchTermB}
              onChange={(e) => handlePlayerSearch("playersB", e.target.value)}
              placeholder="Search Players..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="bg-white border border-gray-300 mt-2 rounded-xl shadow-lg max-h-[150px] overflow-y-auto scrollbar-hide">
              {playersB.map((player) => (
                <div
                  key={player._id}
                  className="px-4 py-3 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out flex items-center space-x-3"
                  onClick={() => handlePlayerSelect("playersB", player)}
                >
                  {player.profilePic ? (
                    <img
                      src={player.profilePic}
                      alt={player.username}
                      className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <FaUserCircle className="text-black text-3xl cursor-pointer" />
                  )}

                  <span className="ml-2">{player.username}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {matchData.playersB.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm hover:bg-green-200 transition"
                >
                  <span className="mr-2">{player.name}</span>
                  <i
                    className="fa-solid fa-xmark cursor-pointer hover:text-red-500"
                    onClick={() => handlePlayerRemove("playersB", player.id)}
                  ></i>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h1 className="text-lg font-semibold mb-3">Select Batting Team</h1>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="batting"
                className="accent-blue-600 w-4 h-4"
                checked={matchData.battingTeam === matchData.teamA}
                onChange={() =>
                  setMatchData({ ...matchData, battingTeam: matchData.teamA })
                }
              />
              <span className="text-gray-800">
                {searchTeamA || "Select Team A"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="batting"
                className="accent-blue-600 w-4 h-4"
                checked={matchData.battingTeam === matchData.teamB}
                onChange={() =>
                  setMatchData({ ...matchData, battingTeam: matchData.teamB })
                }
              />
              <span className="text-gray-800">
                {searchTeamB || "Select Team B"}
              </span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-600">
            Number of Overs
          </h3>
          <input
            type="number"
            value={matchData.overs}
            onChange={(e) =>
              setMatchData({
                ...matchData,
                overs: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Enter number of overs"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-[90%] max-w-md animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Match Created!
              </h2>

              <p className="text-lg text-blue-600 font-semibold">
                Your Match Code:
              </p>

              <div className="text-2xl font-mono font-bold text-gray-900 bg-gray-100 p-3 rounded-md my-3 select-all">
                {matchCode}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(matchCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition font-medium"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>

                <button
                  onClick={EnterMatch}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition font-medium"
                >
                  Enter Match
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 transition"
        >
          Start Match
        </button>
      </div>
    </div>
  );
};

export default SelectMatch;
