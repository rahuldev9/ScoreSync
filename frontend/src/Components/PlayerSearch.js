import React, { useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { FaUserCircle } from "react-icons/fa";

const PlayerSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchPlayers = async (query) => {
    if (!query) return setPlayers([]);
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE}/players?name=${query}`);
      setPlayers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch players");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerDetails = async (playerId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE}/player/${playerId}`);
      setSelectedPlayer(response.data);
      setSearchTerm(""); 
      setPlayers([]); 
    } catch (err) {
      setError("Failed to fetch player details");
    }
  };

  const debouncedFetchPlayers = debounce(fetchPlayers, 400);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchPlayers(value);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Search Players</h2>

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Start typing a player's name..."
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition mb-3"
      />

      {loading && <p className="text-blue-500 text-center mb-2">Loading players...</p>}
      {error && <p className="text-red-500 text-center mb-2">{error}</p>}

      
      {players.map((player) => (
  <div
    key={player._id}
    className="px-4 py-3 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out flex items-center space-x-3"
    onClick={() => fetchPlayerDetails(player._id)}
  >
    {player.profilePic ? (
      <img
        src={player.profilePic}
        alt={player.username}
        className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
      />
    ) : (
      <FaUserCircle className="text-gray-400 text-4xl" />
    )}
    <span className="font-medium">{player.username}</span>
  </div>
))}


      {!loading && searchTerm && players.length === 0 && (
        <p className="text-gray-500 text-center">No players found.</p>
      )}

{selectedPlayer && (
  <div className="mt-6 p-6 bg-white border border-gray-200 rounded-2xl shadow-lg transition-all duration-300 relative">
    {/* Close button */}
    
    {/* Profile Section */}
    <div className="flex items-center gap-6">
    {selectedPlayer.profilePic ? (
  <img
    src={
      selectedPlayer.profilePic.startsWith("data:")
        ? selectedPlayer.profilePic
        : `data:image/jpeg;base64,${selectedPlayer.profilePic}`
    }
    alt="Profile"
    className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md"
  />
) : (
  <FaUserCircle className="text-gray-400 text-6xl" />
)}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800">{selectedPlayer.username}</h3>
        {selectedPlayer.role && (
          <p className="text-blue-500 font-medium text-sm mt-1 capitalize">{selectedPlayer.role}</p>
        )}
      </div>
    </div>

    {/* Stats Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Batting Stats */}
      <div className="bg-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition">
        <h4 className="text-lg font-semibold text-blue-600 mb-2">🏏 Batting</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Runs: <span className="font-medium">{selectedPlayer.stats?.batting?.runs || 0}</span></li>
          <li>Balls Faced: <span className="font-medium">{selectedPlayer.stats?.batting?.ballsFaced || 0}</span></li>
          <li>Fours: <span className="font-medium">{selectedPlayer.stats?.batting?.fours || 0}</span></li>
          <li>Sixes: <span className="font-medium">{selectedPlayer.stats?.batting?.sixes || 0}</span></li>
          <li>Strike Rate: <span className="font-medium">{selectedPlayer.stats?.batting?.strikeRate?.toFixed(2) || "0.00"}</span></li>
        </ul>
      </div>

      {/* Bowling Stats */}
      <div className="bg-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition">
        <h4 className="text-lg font-semibold text-blue-600 mb-2">🎯 Bowling</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Overs: <span className="font-medium">{selectedPlayer.stats?.bowling?.overs || 0}</span></li>
          <li>Runs Given: <span className="font-medium">{selectedPlayer.stats?.bowling?.runsGiven || 0}</span></li>
          <li>Wickets: <span className="font-medium">{selectedPlayer.stats?.bowling?.wickets || 0}</span></li>
          <li>Economy: <span className="font-medium">{selectedPlayer.stats?.bowling?.economy?.toFixed(2) || "0.00"}</span></li>
        </ul>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default PlayerSearch;
