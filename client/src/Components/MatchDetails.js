import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ActivePlayers from "./ActivePlayers";

const MatchDetails = () => {
  const { matchCode } = useParams();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBatter1, setSelectedBatter1] = useState("");
  const [batter1Confirmed, setBatter1Confirmed] = useState(false);
  const [selectedBatter2, setSelectedBatter2] = useState("");
  const [selectedBowler, setSelectedBowler] = useState("");
  const [bowlerConfirmed, setBowlerConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [Inning, setInning] = useState(false);
  const navigate = useNavigate();

  const [batter2Confirmed, setBatter2Confirmed] = useState(false);

  const [Button, setButton] = useState(true);
  const [Hide, setHide] = useState(true);

  const [show, setshow] = useState(localStorage.getItem("state"));

  useEffect(() => {
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

    const open = localStorage.getItem("state");
    const Host = localStorage.getItem("host");
    if (open) {
      setButton(false);
    }

    fetchMatch();
  }, [matchCode]);

  if (loading) {
    return (
      <p className="text-gray-500 text-center mt-6">Loading match details...</p>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-6">{error}</p>;
  }

  const battingTeam = match.teamA.batting ? match.teamA : match.teamB;
  const bowlingTeam = match.teamA.batting ? match.teamB : match.teamA;
  const battingPlayers = match.teamA.batting ? match.playersA : match.playersB;
  const bowlingPlayers = match.teamA.batting ? match.playersB : match.playersA;

  const Host = localStorage.getItem("host");
  const open = localStorage.getItem("state");

  const handleBatter1Submit = async () => {
    if (!selectedBatter1) {
      alert("Please select Batter 1!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/select-batter1`,
        {
          matchCode,
          batterName: selectedBatter1, // Send Player ID
        }
      );

      if (response.data.success) {
        setBatter1Confirmed(true);
      } else {
        alert("Error selecting Batter 1!");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  const handleBatter2Submit = async () => {
    if (!selectedBatter2) {
      alert("Please select Batter 2!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/select-batter2`,
        {
          matchCode,
          batterName: selectedBatter2, // Send Player ID
        }
      );

      if (response.data.success) {
        setBatter2Confirmed(true);
      } else {
        alert("Error selecting Batter 2!");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  const handleBowlerSubmit = async () => {
    if (!selectedBowler) {
      alert("Please select a Bowler!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/select-bowler`,
        {
          matchCode,
          bowlerName: selectedBowler, // Send Player ID
        }
      );

      if (response.data.success) {
        setBowlerConfirmed(true);
        window.location.reload();
        setHide(false);
        localStorage.setItem("state", true);
        window.location.reload();
      } else {
        alert("Error selecting Bowler!");
      }
    } catch (error) {
      alert("Server error. Please try again.");
    }
  };

  const EndMatch = () => {
    localStorage.removeItem("state");
    localStorage.removeItem("host");
    localStorage.removeItem("matchCode");
    navigate("/");
  };
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

  return !Host ? (
    <div className="flex items-center justify-center h-screen w-full bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-700">You are not allowed to view this page.</p>
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto p-6 w-full bg-white shadow-xl rounded-2xl">
      <div className="text-center mb-8 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
          <span className="text-blue-600">{battingTeam.name}</span>
          <span className="text-gray-700">VS</span>
          <span className="text-red-600">{bowlingTeam.name}</span>
        </h2>
      </div>

      {open && <ActivePlayers matchCode={matchCode} />}

      {Button && (
        <div className="mb-6">
          <label className="block font-medium mb-2">
            Select Batter (On-Strike)
          </label>
          <select
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setSelectedBatter1(e.target.value)}
            value={selectedBatter1}
            disabled={batter1Confirmed}
          >
            <option value="">Choose Batter</option>
            {battingPlayers.map((player) => (
              <option key={player.id} value={player.name}>
                {player.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleBatter1Submit}
            disabled={batter1Confirmed}
            className={`w-full mt-3 py-2 rounded-lg ${
              batter1Confirmed
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {batter1Confirmed ? "Batter Selected" : "Submit Batter 1"}
          </button>
        </div>
      )}

      {batter1Confirmed && Hide && (
        <div className="mb-6">
          <label className="block font-medium mb-2">
            Select Batter (Non-Striker)
          </label>
          <select
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setSelectedBatter2(e.target.value)}
            value={selectedBatter2}
            disabled={batter2Confirmed}
          >
            <option value="">Choose Batter</option>
            {battingPlayers
              .filter((p) => p.name !== selectedBatter1)
              .map((player) => (
                <option key={player.id} value={player.name}>
                  {player.name}
                </option>
              ))}
          </select>
          <button
            onClick={handleBatter2Submit}
            disabled={batter2Confirmed}
            className={`w-full mt-3 py-2 rounded-lg ${
              batter2Confirmed
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {batter2Confirmed ? "Batter Selected" : "Submit Batter 2"}
          </button>
        </div>
      )}

      {batter2Confirmed && Hide && (
        <div className="mb-6">
          <label className="block font-medium mb-2">Select Bowler</label>
          <select
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setSelectedBowler(e.target.value)}
            value={selectedBowler}
            disabled={bowlerConfirmed}
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
            disabled={bowlerConfirmed}
            className={`w-full mt-3 py-2 rounded-lg ${
              bowlerConfirmed
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {bowlerConfirmed ? "Bowler Selected" : "Submit Bowler"}
          </button>
        </div>
      )}

      {show && (
        <button
          className="w-full sticky bottom-0 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          onClick={() => setShowModal(true)}
        >
          Change Innings / End Match
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">Match Options</h2>

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 hover:bg-blue-700"
              onClick={() => {
                setShowModal(false);
                StartNewInning();
              }}
            >
              Change Innings
            </button>
            <button
              className="w-full bg-red-500 text-white py-2 rounded-lg mb-3 hover:bg-red-600"
              onClick={EndMatch}
            >
              End Match
            </button>
            <button
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {Inning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-xl shadow-xl w-80 text-center">
            <h2 className="text-lg font-semibold mb-2">Innings Ended</h2>
            <p className="mb-4">Please proceed to the next innings.</p>
            <button
              onClick={StartNewInning}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;
