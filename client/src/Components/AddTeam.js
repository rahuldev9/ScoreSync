import React, { useState } from "react";
import axios from "axios";

const AddTeam = () => {
  const [teamName, setTeamName] = useState("");
  const [teamLogo, setTeamLogo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogoChange = (e) => {
    setSuccess(" ");
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamLogo(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }

    if (!teamLogo) {
      setError("Team logo is required.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/addteam`,
        { name: teamName, logo: teamLogo }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuccess("✅ Team added successfully!");
        setTeamName("");
        setTeamLogo(null);
      }
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">
          Add a New Team
        </h2>

        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter Team Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />

        <div className="mt-4">
          <p className="text-black-600 text-center font-bold m-2">
            Upload Team Logo
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {teamLogo && (
          <div className="mt-4 text-center">
            <img
              src={teamLogo}
              alt="Team Logo Preview"
              className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-blue-500"
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center mt-3">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm text-center mt-3">{success}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl mt-6 hover:bg-blue-700 transition"
        >
          Save Team
        </button>

        <button
          onClick={() => (window.location.href = "/selectmatch")}
          className="w-full bg-gray-300 text-gray-800 font-medium py-3 rounded-xl mt-3 hover:bg-gray-400 transition"
        >
          Select Match
        </button>
      </div>
    </div>
  );
};

export default AddTeam;
