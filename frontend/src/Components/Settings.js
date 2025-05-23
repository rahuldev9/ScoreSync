import React, { useState } from "react";
import axios from "axios";

const Settings = () => {
  const [activeField, setActiveField] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Viewer");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user")); // FIXED
  const user = userData?.id;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {};
    if (activeField === "username") data.username = username;
    if (activeField === "role") data.role = role;
    if (activeField === "profilePic") data.profilePic = profilePic;

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_BASE}/${user}/update-profile`,
        data
      );
      
      console.log(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
      setActiveField(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

        {!activeField && (
          <div className="space-y-3">
            <button
              onClick={() => setActiveField("username")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Change Username
            </button>
            <button
              onClick={() => setActiveField("role")}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Select Role
            </button>
            <button
              onClick={() => setActiveField("profilePic")}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Change Profile Picture
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        )}

        {activeField && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeField === "username" && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {activeField === "role" && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Batting-AllRounder">Batting-AllRounder</option>
                  <option value="Bowling-AllRounder">Bowling-AllRounder</option>
                  <option value="Wk-Batsman">Wk-Batsman</option>
                </select>
              </div>
            )}

            {activeField === "profilePic" && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 w-24 h-24 rounded-full object-cover shadow"
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
