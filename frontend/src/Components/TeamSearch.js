import React, { useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

const TeamSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchTeams = async (query) => {
    if (!query) return setTeams([]);
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/teams?name=${query}`
      );
      setTeams(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE}/team/${teamId}`);
      setSelectedTeam(response.data);
    } catch (err) {
      setError("Failed to fetch team details");
    }
  };

  const debouncedFetchTeams = debounce(fetchTeams, 500);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetchTeams(value);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-md">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search Teams..."
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {teams.length > 0 && (
        <div className="bg-white border rounded shadow-md mt-2">
          {teams.map((team) => (
            <div
              key={team._id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => fetchTeamDetails(team._id)}
            >
              {team.name}
            </div>
          ))}
        </div>
      )}
      {selectedTeam && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow">
          <h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
          <p>Matches Played: {selectedTeam.matchesPlayed}</p>
          <p>Wins: {selectedTeam.wins}</p>
          <p>Losses: {selectedTeam.losses}</p>
        </div>
      )}
    </div>
  );
};

export default TeamSearch;
