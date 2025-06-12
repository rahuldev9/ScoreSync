import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import axios from "axios";

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [UserInfo, setUserInfo] = useState(null);
  const Host = localStorage.getItem("host");
  const matchCode = localStorage.getItem("matchCode");
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE}/user/${userId}`
      );
      setUserInfo(response.data);
    };
    if (userId) fetchUser();
  }, [userId]);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleImage = () => setImageOpen(!imageOpen);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const renderProfileImage = (size = "w-10 h-10") => (
    <img
      src={
        UserInfo?.profilePic?.startsWith("data:")
          ? UserInfo.profilePic
          : `data:image/jpeg;base64,${UserInfo?.profilePic}`
      }
      alt="Profile"
      className={`${size} rounded-full object-cover shadow-md hover:scale-105 ring-2 ring-white cursor-pointer transition-all`}
      onClick={toggleImage}
      title="View Profile"
    />
  );

  return (
    <div className="sticky top-0 z-50 bg-blue-500 p-4 h-[70px] shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo512.png" alt="Logo" className="w-10 h-10" />
          <Link to="/home" className="text-white text-3xl font-bold">
            ScoreSync
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!userData ? (
            <div className="hidden md:flex gap-4">
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-blue-100 px-6 py-2 font-semibold rounded-xl transition"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2 font-semibold rounded-xl transition"
              >
                Login
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-6 text-white font-semibold">
                <Link to="/home" className="nav-link">
                  Home
                </Link>
                <Link to="/playersearch" className="nav-link">
                  Players
                </Link>
                <Link to="/settings" className="nav-link">
                  Settings
                </Link>
                {!Host ? (
                  <button
                    onClick={() => (window.location.href = "/newmatch")}
                    className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2 font-semibold rounded-xl transition"
                  >
                    New Match
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      (window.location.href = `/match/${matchCode}`)
                    }
                    className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2 font-semibold rounded-xl transition"
                  >
                    Edit Match
                  </button>
                )}
              </div>
              {UserInfo?.profilePic ? (
                renderProfileImage("w-10 h-10")
              ) : (
                <FaUserCircle
                  className="text-white text-3xl cursor-pointer"
                  onClick={toggleImage}
                />
              )}
            </>
          )}
          <button className="md:hidden text-white text-xl" onClick={toggleMenu}>
            <FaBars />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMenu}
          ></div>
          <div className="fixed top-0 right-0 h-full w-64 bg-gray-800 text-white z-50 shadow-lg">
            <button
              className="absolute top-4 right-4 text-2xl"
              onClick={toggleMenu}
            >
              <FaTimes />
            </button>
            <div className="flex flex-col items-start p-6 mt-16 space-y-4">
              {!userData ? (
                <>
                  <Link
                    to="/signup"
                    className="bg-white text-blue-600 hover:bg-blue-100 px-6 py-2 font-semibold rounded-xl transition"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2 font-semibold rounded-xl transition"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  {UserInfo?.profilePic ? (
                    renderProfileImage("w-20 h-20")
                  ) : (
                    <FaUserCircle
                      className="text-white text-3xl cursor-pointer"
                      onClick={toggleImage}
                    />
                  )}
                  <Link to="/home" className="nav-link" onClick={toggleMenu}>
                    Home
                  </Link>
                  <Link
                    to="/playersearch"
                    className="nav-link"
                    onClick={toggleMenu}
                  >
                    Players
                  </Link>
                  <Link
                    to="/settings"
                    className="nav-link"
                    onClick={toggleMenu}
                  >
                    Settings
                  </Link>
                  {!Host ? (
                    <button
                      onClick={() => {
                        toggleMenu();
                        window.location.href = "/newmatch";
                      }}
                      className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2 font-semibold rounded-xl transition"
                    >
                      New Match
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        toggleMenu();
                        window.location.href = `/match/${matchCode}`;
                      }}
                      className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-2 font-semibold rounded-xl transition"
                    >
                      Edit Match
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-700 text-white hover:bg-red-800 px-6 py-2 font-semibold rounded-xl transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {imageOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={toggleImage}
        >
          <button
            className="absolute top-5 right-5 text-white text-3xl hover:text-red-400 transition z-50"
            onClick={toggleImage}
          >
            <FaTimes />
          </button>
          {UserInfo?.profilePic ? (
            <div className="flex flex-col items-center space-y-4">
              <img
                src={
                  UserInfo.profilePic.startsWith("data:")
                    ? UserInfo.profilePic
                    : `data:image/jpeg;base64,${UserInfo.profilePic}`
                }
                alt="Profile"
                className="w-72 h-72 rounded-full object-cover shadow-lg ring-2 ring-white"
              />
              <p className="text-lg font-semibold text-white">
                {UserInfo.username}
              </p>
              <p className="text-lg font-semibold text-white">
                {UserInfo.role}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg font-semibold text-white">NO PROFILE</p>
              <p>
                <Link
                  to="/settings"
                  className="text-lg font-semibold text-white  hover:text-gray-300"
                >
                  Update Profile
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavBar;
