import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/full`);
      const data = await res.json();
      if (data.success) {
        const reversed = [...data.matches].reverse(); 
        setMatches(reversed);
        setFilteredMatches(reversed);
      } else {
        setError("No matches found");
      }
    } catch (err) {
      setError("Error fetching matches.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredMatches(
      matches.filter(
        (m) =>
          m.teamA.name.toLowerCase().includes(lower) ||
          m.teamB.name.toLowerCase().includes(lower)
      )
    );
  }, [search, matches]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const GoToScoreCard = (matchCode) => {
    navigate("/scorecard", { state: { matchCode } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6 flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-700">ScoreSync</h1>
        <p className="mt-3 text-lg text-gray-600">
          Real-time score tracking for your favorite games!
        </p>
        <button
          onClick={fetchMatches}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:scale-105 transition-transform"
        >
          Refresh Matches
        </button>
      </div>

      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Live Matches</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team name..."
            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {error && (
          <div className="text-red-600 text-center mb-4">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 h-40"
              ></div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <p className="text-center text-gray-600 mt-6">
            No matches found for your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match, index) => (
              <div
                key={index}
                onClick={() => GoToScoreCard(match.matchCode)}
                className="cursor-pointer bg-white p-5 rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-gray-100"
              >
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  {match?.Live && !match.Winners && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                      <span className="text-xs text-green-600">Live</span>
                    </div>
                  )}
                  <span>{formatDate(match.date)}</span>
                  <span className="font-medium text-blue-600">
                    {match.overs} overs
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {match.teamA.name} vs {match.teamB.name}
                </h3>

                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <strong>{match.teamA.name}</strong> - {" "}
                    {match.teamA.score}/{match.teamA.wickets} in{" "}
                    {match.teamB.overs}.{match.teamB.ballsInCurrentOver} overs
                  </p>
                  <p>
                    <strong>{match.teamB.name}</strong> - {" "}
                    {match.teamB.score}/{match.teamB.wickets} in{" "}
                    {match.teamA.overs}.{match.teamA.ballsInCurrentOver} overs
                  </p>
                  {match?.Target !== 0 && match.Winners && (
                    <p className="text-blue-800 font-semibold">
                      {match.Winners} Won the Match
                    </p>
                  )}
                  {!match?.Winners && (
                    <p className="text-red-600 font-semibold">
                      {match.WinningRuns}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
