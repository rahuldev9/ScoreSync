import { useState, useEffect } from "react";
import axios from "axios";
import WinningPopup from "./WinningPopup";
import commentaryData from "./commentaryData";
import CommentaryFeed from "./Commentary";

const ActivePlayers = ({ matchCode }) => {
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extraRunInput, setExtraRunInput] = useState({
    show: false,
    key: null,
    type: "",
  });
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [dismissedBatter, setDismissedBatter] = useState("");
  const [dismissalType, setDismissalType] = useState("");
  const [batterKey, setBatterKey] = useState(null);
  const [selectedBowler, setSelectedBowler] = useState("");
  const [bowlerConfirmed, setBowlerConfirmed] = useState(false);
  const [selectedBatter, setSelectedBatter] = useState("");
  const [batterConfirmed, setBatterConfirmed] = useState(false);
  const [isBowlerChangeOpen, setIsBowlerChangeOpen] = useState(false);
  const [isBatterChangeOpen, setIsBatterChangeOpen] = useState(false);
  const [match, setMatch] = useState(null);
  const [Inning, setInning] = useState(false);
  const [isOpenbat, setIsOpenbat] = useState(false);
  const [isOpenbowl, setIsOpenbowl] = useState(false);
  const [popup, setPopup] = useState(false);
  const [winningTeam, setWinningTeam] = useState(null);
  const [NeedRuns, setNeedRuns] = useState(null);
  const [BatTeamLogo, setBatTeamLogo] = useState(null);
  const [BowlTeamLogo, setBowlTeamLogo] = useState(null);
  const [showPopup, setshowPopup] = useState(false);

  const currentBattingPlayers = match?.teamA?.batting
    ? match?.playersA
    : match?.playersB;

  const currentBattingTeam = match?.teamA?.batting ? match.teamA : match?.teamB;
  const currentBowlingTeam = match?.teamA?.batting ? match.teamB : match?.teamA;

  const wickets = currentBattingTeam?.wickets || 0;
  const overs = currentBowlingTeam?.overs || 0;
  const target = match?.Target;

  setTimeout(() => {
    if (
      wickets === currentBattingPlayers?.length - 1 ||
      overs === match?.overs
    ) {
      if (target === 0) {
        setInning(true);
      } else {
        setWinningTeam(currentBowlingTeam);
        setPopup(true);
        console.log(currentBowlingTeam);
      }
    }

    if (target && currentBattingTeam?.score === target) {
      setWinningTeam({ name: "It's a Tie!", isTie: true });
      setPopup(true);
    } else if (target !== 0 && currentBattingTeam?.score >= target) {
      setWinningTeam(currentBattingTeam);

      setPopup(true);
    }
  }, 100);

  const StartNewInning = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/toggle-innings/${matchCode}`
      );
      setInning(false);
      localStorage.removeItem("state");
      window.location.reload();
    } catch (error) {
      console.error("Failed to toggle innings:", error);
    }
  };

  useEffect(() => {
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
        setError("Failed to fetch active players");
      } finally {
        setLoading(false);
      }
    };

    const fetchMatch = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE}/verify-match`,
          { matchCode }
        );
        if (response.data.success) {
          setMatch(response.data.match);
        } else {
          setError("Match not found.");
        }
      } catch (error) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    const Runs = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE}/require-runs/${matchCode}`
        );
        if (response.data) {
          setNeedRuns(response.data.match);
          console.log(response.data.match);
        }
      } catch (error) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
    Runs();
    fetchActivePlayers();
  }, [matchCode]);

  const battingTeam = match?.teamA?.batting ? match.teamA : match?.teamB;
  const bowlingTeam = match?.teamA?.batting ? match.teamB : match?.teamA;

  const battingPlayers = match?.teamA?.batting
    ? match?.playersA
    : match?.playersB;

  const notOutBatters = battingPlayers?.filter(
    (player) => player?.stats?.batting?.out === false
  );
  console.log(notOutBatters);

  const bowlingPlayers = match?.teamA?.batting
    ? match?.playersB
    : match?.playersA;

  const Commentary = async (type, run) => {
    const over = `${bowlingTeam?.overs}.${bowlingTeam?.ballsInCurrentOver + 1}`;

    const batter1Id = match?.activeBatter1?.player?.toString();
    const batter2Id = match?.activeBatter2?.player?.toString();
    const bowlerId = match?.activeBowler?.toString();

    const batter1 = battingPlayers?.find(
      (player) => player.id.toString() === batter1Id
    );
    const batter2 = battingPlayers?.find(
      (player) => player.id.toString() === batter2Id
    );
    const activeBowler = bowlingPlayers?.find(
      (player) => player.id.toString() === bowlerId
    );

    const batterName = match?.activeBatter1?.onStrike
      ? batter1?.name
      : batter2?.name;
    const bowlerName = activeBowler?.name || "Unknown Bowler";

    let commentaryLine = "";
    const options = commentaryData[type];

    if (options && options.length > 0) {
      const randomIndex = Math.floor(Math.random() * options.length);
      const template = options[randomIndex];
      commentaryLine = template
        .replace("{batter}", batterName || "Batter")
        .replace("{bowler}", bowlerName || "Bowler");
    } else {
      commentaryLine = `${batterName} scores ${run} run${
        run > 1 ? "s" : ""
      } off ${bowlerName}`;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/commentary/${matchCode}`,
        {
          over: over,
          batter: batterName || "Unknown Batter",
          bowler: bowlerName,
          runs: run,
          type: type,
          text: commentaryLine,
        }
      );
      console.log("Commentary sent:", response.data);
    } catch (error) {
      console.error("Failed to send commentary:", error);
    }
  };

  const increaseRun = async (
    key,
    runValue,
    type = "normal",
    wicket = false
  ) => {
    try {
      const isLegalDelivery = !["wide", "no-ball"].includes(type);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/update-run/${matchCode}`,
        {
          playerKey: key,
          runs: runValue,
          type,
          wicket,
          countBall: isLegalDelivery,
        }
      );

      Commentary(type, runValue);

      const [playersRes, matchRes, RunsRequire] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE}/active-players/${matchCode}`),
        axios.post(`${process.env.REACT_APP_API_BASE}/verify-match`, { matchCode }),
        axios.get(`${process.env.REACT_APP_API_BASE}/require-runs/${matchCode}`),
      ]);

      setPlayers(playersRes.data);
      if (matchRes.data.success) setMatch(matchRes.data.match);
      if (RunsRequire.data) setNeedRuns(RunsRequire.data.match);

      const balls =
        playersRes.data?.activeBowler?.stats?.bowling?.ballsInCurrentOver;
      if (balls === 0) setIsBowlerChangeOpen(true);
    } catch (err) {
      console.error("Failed to update run in database", err);
    }
  };

  const handleExtraRunInput = (key, type) => {
    setExtraRunInput({ show: true, key, type });
  };

  const submitExtraRun = (runValue) => {
    const runs = parseInt(runValue);
    if (!isNaN(runs) && extraRunInput.key && extraRunInput.type) {
      const baseType = extraRunInput.type.split("+")[0];
      increaseRun(extraRunInput.key, runs, baseType);
    }
    setExtraRunInput({ show: false, key: null, type: "" });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const handleWicketSubmit = async () => {
    if (!dismissedBatter || !dismissalType) {
      alert("Please select the dismissal type.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE}/wicket-event`, {
        matchCode,
        dismissedBatter,
        dismissalType,
      });

      Commentary(dismissalType, 0);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/active-players/${matchCode}`
      );
      setPlayers(response.data);
      setIsBatterChangeOpen(true);
      setIsWicketModalOpen(false);
      setDismissedBatter("");
      setDismissalType("");
      setBatterKey(null);
    } catch (error) {
      console.error("Error updating wicket:", error);
      alert("Failed to update wicket.");
    }
  };

  const handleBowlerSubmit = async () => {
    if (!selectedBowler) {
      alert("Please select a Bowler!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/select-bowlerChange`,
        {
          matchCode,
          bowlerName: selectedBowler, // Send Player ID
        }
      );
      setTimeout(async () => {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE}/active-players/${matchCode}`
        );
        setPlayers(response.data);
      }, 300);

      if (response.data.success) {
        setBowlerConfirmed(true);
        window.location.reload();
        setIsBowlerChangeOpen(false);
      } else {
        alert("Error selecting Bowler!");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  const handleBatterSubmit = async () => {
    if (!selectedBatter) {
      alert("Please select Batter 1!");
      return;
    }
    localStorage.setItem("state", true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE}/select-batter`, {
        matchCode,
        batterName: selectedBatter, // Send Player ID
      });
      setTimeout(async () => {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE}/active-players/${matchCode}`
        );
        setPlayers(response.data);
      }, 300);

      if (response.data.success) {
        setBatterConfirmed(true);
        setIsBatterChangeOpen(false);
        window.location.reload();
      } else {
        alert("Error selecting Batter 1!");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };
  const ChangeBatterBowlers = () => {
    localStorage.removeItem("state");
    window.location.reload();
  };

  const ToggleStrike = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/togglestrike`,
        { matchCode }
      );
      if (response.data.success) {
        window.location.reload();
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };
  const runTypes = {
    1: "normal",
    2: "normal",
    3: "normal",
    4: "four",
    5: "normal",
    6: "six",
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center sticky top-12 z-10 space-y-3">
        <h3 className="text-2xl font-bold text-blue-700">
          {battingTeam.name}{" "}
          <span className="text-sm text-gray-500">- Batting</span>
        </h3>

        <div className="flex items-center justify-between">
          {BatTeamLogo && (
            <img
              src={BatTeamLogo.logo}
              alt="Batting Team Logo"
              className="w-10 h-10 object-cover rounded-full border-2 border-blue-500"
            />
          )}

          <div className="text-4xl font-extrabold text-gray-900">
            {battingTeam.score}/{battingTeam.wickets}
          </div>

          {BowlTeamLogo && (
            <img
              src={BowlTeamLogo.logo}
              alt="Bowling Team Logo"
              className="w-10 h-10 object-cover rounded-full border-2 border-red-500"
            />
          )}
        </div>

        <p className="text-sm text-gray-500">
          Overs:{" "}
          <span className="font-medium text-gray-700">
            {bowlingTeam.overs}.{bowlingTeam.ballsInCurrentOver}
          </span>{" "}
          / {match.overs}
        </p>

        {match?.Target !== 0 && (
          <div className="space-y-1">
            {!match.winners && (
              <p className="text-green-600 font-semibold">
                {match.WinningRuns}
              </p>
            )}
            <p className="text-sm text-gray-700">
              Target: <span className="font-semibold">{match.Target}</span>
            </p>
          </div>
        )}
      </div>

      <h2
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        Active Players
      </h2>

      <h3 style={{ textAlign: "center", marginTop: "12px" }}>Batters</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "16px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Player</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>R</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>B</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>6s</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>4s</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>SR</th>
          </tr>
        </thead>
        <tbody>
          {["activeBatter1", "activeBatter2"].map((key) => {
            const player = players?.[key];
            if (!player) return null;

            return (
              <tr key={key}>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.name}
                  {player.onStrike ? "🏏" : " "}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.batting?.runs || "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.batting?.ballsFaced || "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.batting?.sixes || "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.batting?.fours || "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.batting?.strikeRate || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 style={{ textAlign: "center" }}>Bowler</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>Player</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>O</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>R</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>W</th>
            <th style={{ padding: "8px", border: "1px solid #ccc" }}>
              Economy
            </th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const player = players?.activeBowler;
            if (!player) return null;

            return (
              <tr>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.name}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.bowling?.overs || "0"}.
                  {player.stats.bowling?.ballsInCurrentOver || "0"}{" "}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.bowling?.runsGiven || "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.bowling?.wickets || "-"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                  {player.stats.bowling?.economy || "-"}
                </td>
              </tr>
            );
          })()}
        </tbody>
      </table>
      <div>
        <h2 className="text-xl font-bold text-center mb-4">Award Runs</h2>
        {["activeBatter1", "activeBatter2"].map((key) => {
          const player = players?.[key];
          if (!player?.onStrike) return null;

          return (
            <div key={key} className="space-y-4 mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6].map((run) => {
                  const type = runTypes[run];
                  return (
                    <button
                      key={run}
                      onClick={() => increaseRun(key, run, type)}
                      className={`px-4 py-1.5 rounded-md text-white font-semibold transition ${
                        run === 4
                          ? "bg-blue-500 hover:bg-blue-600"
                          : run === 6
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      +{run}
                    </button>
                  );
                })}
                <button
                  onClick={() => increaseRun(key, 0, "dot")}
                  className="px-4 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  Dot
                </button>
                <button
                  onClick={() => increaseRun(key, 0, "wide")}
                  className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
                >
                  Wide
                </button>
                <button
                  onClick={() => handleExtraRunInput(key, "wide+runs")}
                  className="px-4 py-1.5 bg-purple-300 hover:bg-purple-400 text-black rounded-md"
                >
                  Wide + Runs
                </button>
                <button
                  onClick={() => increaseRun(key, 0, "no-ball")}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                >
                  No Ball
                </button>
                <button
                  onClick={() => handleExtraRunInput(key, "no-ball+runs")}
                  className="px-4 py-1.5 bg-orange-300 hover:bg-orange-400 text-black rounded-md"
                >
                  No Ball + Runs
                </button>
                <button
                  onClick={() => handleExtraRunInput(key, "leg-bye+runs")}
                  className="px-4 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-black rounded-md"
                >
                  Leg Bye + Runs
                </button>
                <button
                  onClick={() => {
                    setIsWicketModalOpen(true);
                    setDismissedBatter(player.name);
                    setBatterKey(key);
                  }}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Wicket
                </button>
                <button
                  onClick={() => setshowPopup(true)}
                  className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Change Batters / Bowlers
                </button>
                <button
                  onClick={ToggleStrike}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md"
                >
                  Toggle Strike
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Select Action
            </h2>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setIsBowlerChangeOpen(true);
                  setshowPopup(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Change Bowler
              </button>
              <button
                onClick={() => {
                  setIsBatterChangeOpen(true);
                  setshowPopup(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
              >
                Change Batter
              </button>
            </div>

            <button
              onClick={() => setshowPopup(false)}
              className="mt-4 text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6">
        <div>
          <button
            onClick={() => setIsOpenbat(!isOpenbat)}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md flex justify-between items-center hover:bg-blue-700 transition-colors"
          >
            <span>{battingTeam.name} Batting</span>
            <span className="text-lg">{isOpenbat ? "▲" : "▼"}</span>
          </button>

          {isOpenbat && (
            <div className="overflow-x-auto mt-4 transition-all duration-300 ease-in-out">
              <table className="min-w-full bg-white rounded-xl shadow-sm overflow-hidden text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3">Runs</th>
                    <th className="px-4 py-3">Balls</th>
                    <th className="px-4 py-3">4s</th>
                    <th className="px-4 py-3">6s</th>
                    <th className="px-4 py-3">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {battingPlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-50 text-center"
                    >
                      <td className="px-4 py-2 text-left font-medium">
                        {player.name}
                      </td>
                      <td className="px-4 py-2">{player.stats.batting.runs}</td>
                      <td className="px-4 py-2">
                        {player.stats.batting.ballsFaced}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.batting.fours}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.batting.sixes}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.batting.strikeRate.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setIsOpenbowl(!isOpenbowl)}
            className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md flex justify-between items-center hover:bg-red-700 transition-colors"
          >
            <span>{bowlingTeam.name} Bowling</span>
            <span className="text-lg">{isOpenbowl ? "▲" : "▼"}</span>
          </button>

          {isOpenbowl && (
            <div className="overflow-x-auto mt-4 transition-all duration-300 ease-in-out">
              <table className="min-w-full bg-white rounded-xl shadow-sm overflow-hidden text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3">Overs</th>
                    <th className="px-4 py-3">Runs</th>
                    <th className="px-4 py-3">Wickets</th>
                    <th className="px-4 py-3">Economy</th>
                  </tr>
                </thead>
                <tbody>
                  {bowlingPlayers.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-gray-50 text-center"
                    >
                      <td className="px-4 py-2 text-left font-medium">
                        {player.name}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.bowling.overs}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.bowling.runsConceded}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.bowling.wickets}
                      </td>
                      <td className="px-4 py-2">
                        {player.stats.bowling.economy.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 py-6 ">
        <CommentaryFeed commentary={match.commentary} />
      </div>
      {extraRunInput.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">
              Enter runs for{" "}
              <span className="text-blue-600">
                {extraRunInput.type.replace("+", " + ").toUpperCase()}
              </span>
            </h3>
            <input
              type="number"
              min="0"
              id="extraRunInputField"
              placeholder="Enter run(s)"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  const val =
                    document.getElementById("extraRunInputField").value;
                  submitExtraRun(val);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Submit
              </button>
              <button
                onClick={() =>
                  setExtraRunInput({ show: false, key: null, type: "" })
                }
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isWicketModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-center">
              Wicket Details
            </h3>
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {["Bowled", "Catch", "RunOut", "Hit Wicket"].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-md transition ${
                    dismissalType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setDismissalType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={handleWicketSubmit}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}

      {isBowlerChangeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
            <label className="block font-medium mb-2">Select Bowler:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              onChange={(e) => setSelectedBowler(e.target.value)}
              value={selectedBowler}
            >
              <option value="">Choose Bowler</option>
              {bowlingPlayers.map((player) => (
                <option key={player.id} value={player.name}>
                  {player.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBowlerSubmit}
              className={`w-full p-2 rounded-md ${
                bowlerConfirmed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={bowlerConfirmed}
            >
              {bowlerConfirmed ? "Bowler Selected" : "Submit Bowler"}
            </button>
          </div>
        </div>
      )}

      {isBatterChangeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
            <label className="block font-medium mb-2">
              Select Batter (on-strike)
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              onChange={(e) => setSelectedBatter(e.target.value)}
              value={selectedBatter}
            >
              <option value="">Choose Batter</option>
              {battingPlayers.map((player) => (
                <option key={player.id} value={player.name}>
                  {player.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBatterSubmit}
              className={`w-full p-2 rounded-md mb-2 ${
                batterConfirmed
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={batterConfirmed}
            >
              {batterConfirmed ? "Batter Selected" : "Submit Batter"}
            </button>
          </div>
        </div>
      )}

      {Inning && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-lg shadow-lg max-w-sm w-full z-10">
            <h2 className="text-lg font-semibold mb-2">Innings Ended</h2>
            <p>Please proceed to the next innings.</p>
            <button
              onClick={StartNewInning}
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {popup && !Inning && (
        <WinningPopup
          winningTeam={winningTeam}
          matchCode={matchCode}
          onClose={() => setPopup(false)}
        />
      )}
    </div>
  );
};

export default ActivePlayers;
