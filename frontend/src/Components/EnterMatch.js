import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EnterMatch = () => {
  const [matchCode, setMatchCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");

    if (!matchCode.trim()) {
      setError("Please enter a match code.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/verify-match`,
        { matchCode }
      );

      if (response.data.success) {
        localStorage.setItem("matchCode", matchCode);
        navigate(`/match/${matchCode}`);
      } else {
        setError("Invalid match code. Please try again.");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Enter Match Code
        </h2>

        <input
          type="text"
          value={matchCode}
          onChange={(e) => setMatchCode(e.target.value)}
          placeholder="Enter Match Code"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <button
          onClick={handleVerify}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Verify Match Code
        </button>
      </div>
    </div>
  );
};

export default EnterMatch;
