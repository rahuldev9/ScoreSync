import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WinningPopup = ({ winningTeam, onClose,matchCode }) => {
  const navigate = useNavigate();
  const [TieMatch, setTieMatch] = useState(false);

  useEffect(() => {
    
    if (winningTeam?.name === "It's a Tie!") {
      setTieMatch(true);
    }
    const EnterWinners=async()=>{
        const winner = winningTeam?.name
        console.log(winner,matchCode)
        try{
            const response = await axios.post(`${process.env.REACT_APP_API_BASE}/Winner`,{winner,matchCode});
            if(response){
                console.log('Entered Winners name')
            }else{
                console.log('No')
            }
    
        }catch(error){
            console.log(error)
        }
    }
    EnterWinners()
  }, [winningTeam,matchCode]);

  const GoToSummary = () => {
    localStorage.removeItem("state");
    localStorage.removeItem("host");
    localStorage.removeItem("matchCode");
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
        {!TieMatch && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {winningTeam?.name} Wins!
            </h2>
            <p className="text-gray-600 mb-6">
              {winningTeam?.name} won the match with a stunning performance!
            </p>
            <button
              onClick={() => {
                onClose();
                GoToSummary();
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition-all duration-200"
            >
              Close
            </button>
          </>
        )}

        {TieMatch && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {winningTeam?.name}
            </h2>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Super Over Time!
            </h2>
            <button
              onClick={() => {
                onClose();
                GoToSummary();
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition-all duration-200"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WinningPopup;
