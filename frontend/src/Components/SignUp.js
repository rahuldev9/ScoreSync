import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const SignUp = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); 

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE}/data`, form);
      if (response) {
        setTimeout(() => navigate("/login"), 1000);
        
      }
    } catch (error) {
      setLoading(false)
      if (error.response) {
        setError(error.response.data.error || "Something went wrong");
      } else {
        setError("Network error. Please try again.");
      }
    }
    
  };

  return (
    <div className="flex items-center justify-center h-full pt-10 bg-white-900">
      
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Welcome to ScoreSync</h1>
        <p className="text-gray-600 mb-4">Track live scores effortlessly</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Sign Up</h2>
        <form onSubmit={submitForm} className="space-y-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            type="email"
            name="email"
            value={form.email}
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
      Signing you up...
    </>
  ) : (
    "Sign Up"
  )}
</button>
          <p className="text-gray-600">Already have an account? <a href='/login' className="text-blue-500 font-semibold">Login</a></p>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUp;