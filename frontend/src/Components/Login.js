import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [Message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/login`,
        form
      );
      if (response) {
        setTimeout(() => navigate("/"), 1000);
        
      }
      if (response.data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify({ id: response.data.user.id })
        );
        
      } else {
        setMessage(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      setLoading(false)
      setError("Network error. Please try again or Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-full pt-20 bg-white-900">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome to ScoreSync
        </h1>
        <p className="text-gray-600 mb-4">Your go-to live score tracker</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Login</h2>
        <form onSubmit={submitForm} className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username or Email"
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
          />

<div className="relative w-full">
      <input
        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Password"
        type={showPassword ? "text" : "password"}
        name="password"
        value={form.password}
        onChange={handleChange}
      />
      <span
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
      >
        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
      </span>
    </div>
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline hover:text-blue-600 transition duration-200"
            >
              Forgot your password?
            </Link>
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
                Logging you in...
              </>
            ) : (
              "Log In"
            )}
          </button>

          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 font-semibold">
              Sign Up
            </a>
          </p>
          {Message && <p className="text-red-500 text-center">{Message}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
