import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import CommentaryFeed from "./Commentary";

const ScoreCard = () => {
  const location = useLocation();
  const matchCode = location.state?.matchCode;
  const [players, setPlayers] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [BatTeamLogo, setBatTeamLogo] = useState(null);
  const [BowlTeamLogo, setBowlTeamLogo] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    teamA: false,
    teamB: false,
  });

  useEffect(() => {
    let intervalId;

    const fetchMatchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE}/scorecard/${matchCode}`
        );
        setMatchData(response.data.match);
      } catch (err) {
        console.error("Error fetching match data:", err);
        setError("Failed to load match data");
      } finally {
        setLoading(false);
      }
    };

    const fetchActivePlayers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE}/active-players/${matchCode}`
        );
        setPlayers(response.data);
        const BatTeamLogo = response?.data?.BattingLogo;
        setBatTeamLogo(BatTeamLogo);
        const BowlTeamLogo = response?.data?.BowlingLogo;
        setBowlTeamLogo(BowlTeamLogo);
      } catch (err) {
        console.error("Error fetching active players:", err);
        setError("Failed to fetch active players");
      }
    };

    if (matchCode) {
      fetchMatchData();
      fetchActivePlayers();

      intervalId = setInterval(() => {
        fetchMatchData();
        fetchActivePlayers();
      }, 5000);
    } else {
      setLoading(false);
    }

    return () => clearInterval(intervalId);
  }, [matchCode]);

  const toggleSection = (teamKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [teamKey]: !prev[teamKey],
    }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatOvers = (overs, ballsInCurrentOver) => {
    const totalBalls = overs * 6 + ballsInCurrentOver;
    return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
  };

  if (loading)
    return <p className="text-gray-600 animate-pulse">Loading match data...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!matchData)
    return <p className="text-red-600">Match data not available.</p>;
  if (!players) return <p className="text-gray-600">Loading player data...</p>;

  const battingTeam = matchData?.teamA?.batting
    ? matchData.teamA
    : matchData.teamB;
  const bowlingTeam = matchData?.teamA?.batting
    ? matchData.teamB
    : matchData.teamA;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm py-3 mb-6 text-center">
        <p className="text-sm text-gray-500">{formatDate(matchData.date)}</p>

        <div className="flex items-center justify-between px-4">
          {BatTeamLogo && (
            <img
              src={BatTeamLogo.logo}
              alt="Batting Team Logo"
              className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
            />
          )}

          <div className="flex flex-col items-center justify-center space-y-1">
            <h1 className="text-xl font-bold text-blue-700">
              {battingTeam.name}
            </h1>
            <h1 className="text-xl font-bold text-blue-700">
              {battingTeam.score}/{battingTeam.wickets}
            </h1>
            <span className="text-gray-600 text-sm">
              Overs:{" "}
              {formatOvers(bowlingTeam.overs, bowlingTeam.ballsInCurrentOver)}/
              {matchData.overs}
            </span>
            {matchData?.Live && !matchData.Winners && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs text-gray-600">Live</span>
              </div>
            )}
          </div>

          {BowlTeamLogo && (
            <img
              src={BowlTeamLogo.logo}
              alt="Bowling Team Logo"
              className="w-10 h-10 object-cover rounded-full border-2 border-red-500"
            />
          )}
        </div>

        {matchData?.Target !== 0 && matchData.Winners && (
          <p className="text-blue-800 font-semibold mt-2">
            {matchData.Winners} Won the Match
          </p>
        )}
        {!matchData?.Winners && (
          <p className="text-red-600 font-semibold">{matchData.WinningRuns}</p>
        )}
      </div>

      <h2 className="text-center text-lg font-semibold mb-2">
        Current Batters
      </h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2">Runs</th>
              <th className="px-4 py-2">Balls</th>
              <th className="px-4 py-2">6s</th>
              <th className="px-4 py-2">4s</th>
              <th className="px-4 py-2">SR</th>
            </tr>
          </thead>
          <tbody>
            {["activeBatter1", "activeBatter2"].map((key) => {
              const player = players?.[key];
              if (!player) return null;
              return (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">
                    {player.name} {player.onStrike && "🏏"}
                  </td>
                  <td className="px-4 py-2">
                    {player.stats.batting?.runs ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    {player.stats.batting?.ballsFaced ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    {player.stats.batting?.sixes ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    {player.stats.batting?.fours ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    {player.stats.batting?.strikeRate ?? "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="text-center text-lg font-semibold mb-2">Current Bowler</h2>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2">Overs</th>
              <th className="px-4 py-2">Runs</th>
              <th className="px-4 py-2">Wickets</th>
              <th className="px-4 py-2">Economy</th>
            </tr>
          </thead>
          <tbody>
            {players?.activeBowler && (
              <tr className="hover:bg-gray-50 bg-red-50">
                <td className="px-4 py-2 font-medium">
                  {players.activeBowler.name}
                </td>
                <td className="px-4 py-2">
                  {players.activeBowler.stats.bowling.overs}.
                  {players.activeBowler.stats.bowling.ballsInCurrentOver}
                </td>
                <td className="px-4 py-2">
                  {players.activeBowler.stats.bowling.runsGiven}
                </td>
                <td className="px-4 py-2">
                  {players.activeBowler.stats.bowling.wickets}
                </td>
                <td className="px-4 py-2">
                  {players.activeBowler.stats.bowling.economy}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {[
        ["teamA", "playersA"],
        ["teamB", "playersB"],
      ].map(([teamKey, playersKey]) => {
        const team = matchData[teamKey];
        const teamPlayers = matchData[playersKey];
        const isExpanded = expandedSections[teamKey];

        return (
          <div
            key={teamKey}
            className="mb-6 border border-gray-200 rounded-lg shadow-sm"
          >
            <button
              className="w-full text-left px-6 py-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
              onClick={() => toggleSection(teamKey)}
            >
              <span className="text-lg font-semibold text-blue-700">
                {team?.name} - {team?.score}/{team?.wickets}
                <span className="ml-2 text-sm text-gray-600">
                  (Overs: {formatOvers(team?.overs, team?.ballsInCurrentOver)}/
                  {matchData.overs})
                </span>
              </span>
              <span
                className={`text-xl text-gray-500 transform transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <div
              className={`transition-all overflow-hidden duration-500 ${
                isExpanded ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className="px-4 py-4">
                <h3 className="text-lg font-semibold mb-2">Batting</h3>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="px-4 py-2">Player</th>
                        <th className="px-4 py-2">Runs</th>
                        <th className="px-4 py-2">Balls</th>
                        <th className="px-4 py-2">4s</th>
                        <th className="px-4 py-2">6s</th>
                        <th className="px-4 py-2">SR</th>
                        <th className="px-4 py-2">Out</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {teamPlayers.map((p, i) => {
                        const isActive =
                          p._id === matchData.activeBatter1?.player?._id ||
                          p._id === matchData.activeBatter2?.player?._id;
                        return (
                          <tr
                            key={i}
                            className={
                              isActive ? "bg-green-100" : "hover:bg-gray-50"
                            }
                          >
                            <td className="px-4 py-2">{p.name}</td>
                            <td className="px-4 py-2">
                              {p.stats.batting.runs}
                            </td>
                            <td className="px-4 py-2">
                              {p.stats.batting.ballsFaced}
                            </td>
                            <td className="px-4 py-2">
                              {p.stats.batting.fours}
                            </td>
                            <td className="px-4 py-2">
                              {p.stats.batting.sixes}
                            </td>
                            <td className="px-4 py-2">
                              {p.stats.batting.strikeRate?.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              {p.stats.batting.out ? "Out" : "Not Out"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-2">Bowling</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="px-4 py-2">Player</th>
                        <th className="px-4 py-2">Overs</th>
                        <th className="px-4 py-2">Runs</th>
                        <th className="px-4 py-2">Wickets</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {teamPlayers
                        .filter(
                          (p) =>
                            p.stats.bowling.overs ||
                            p.stats.bowling.ballsInCurrentOver
                        )
                        .map((p, i) => {
                          const totalBalls =
                            p.stats.bowling.overs * 6 +
                            p.stats.bowling.ballsInCurrentOver;
                          const oversFormatted = `${Math.floor(
                            totalBalls / 6
                          )}.${totalBalls % 6}`;
                          const isActive =
                            p._id === matchData.activeBowler?._id;
                          return (
                            <tr
                              key={i}
                              className={
                                isActive ? "bg-red-100" : "hover:bg-gray-50"
                              }
                            >
                              <td className="px-4 py-2">{p.name}</td>
                              <td className="px-4 py-2">{oversFormatted}</td>
                              <td className="px-4 py-2">
                                {p.stats.bowling.runsGiven}
                              </td>
                              <td className="px-4 py-2">
                                {p.stats.bowling.wickets}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-8 bg-gray-50 rounded-lg p-4 shadow-sm">
        <CommentaryFeed commentary={matchData.commentary} />
      </div>
    </div>
  );
};

export default ScoreCard;
