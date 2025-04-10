import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"

const ResetPassword = () => {
  const { token } = useParams(); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEnteredPassword, setShowEnteredPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate()
  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE}/reset-password`, {
        token,
        newPassword: password,
      });
      setMessage(response.data.message || "Password has been reset.");
      if (response) {
        setLoading(false)
        navigate("/login")
      }
    } catch (err) {
      setLoading(false)
      setError("Failed to reset password.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">

        <div className="relative w-full">
      <input
        type={showEnteredPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <span
        onClick={() => setShowEnteredPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
      >
        {showEnteredPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
      </span>
    </div>
        <div className="relative w-full">
      <input
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm password"
        className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
      <span
        onClick={() => setShowConfirmPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
      >
        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
      </span>
    </div>
        <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center bg-blue-500 text-white p-3 rounded-lg transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
                Password Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        {message && <p className="text-green-600 text-center">{message}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
