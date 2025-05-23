import React from "react";

const CommentaryFeed = ({ commentary }) => {
  return (
    <div className="mx-auto p-4 w-full max-h-[400px] overflow-auto scrollbar-hide">
      <h2 className="text-xl font-semibold mb-4">Live Commentary</h2>
      <div className="space-y-4 ">
        {[...commentary].reverse().map((entry, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl shadow-md border border-gray-100"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-blue-700"> {entry.over}</span>
              {entry.type === "normal" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  R
                </div>
              )}
              {entry.type === "six" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold">
                  6
                </div>
              )}
              {entry.type === "four" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold">
                  4
                </div>
              )}
              {entry.type === "Catch" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  W
                </div>
              )}
              {entry.type === "Bowled" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  W
                </div>
              )}
              {entry.type === "RunOut" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  W
                </div>
              )}
              {entry.type === "Hit Wicket" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  W
                </div>
              )}

              {entry.type === "no-ball" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                  N
                </div>
              )}
              {entry.type === "leg-bye" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 text-xs font-bold">
                  L
                </div>
              )}
              {entry.type === "wide" && (
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-pink-100 text-blue-800 text-xs font-bold">
                  W
                </div>
              )}
            </div>
            <p className="text-gray-800">{entry.text}</p>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{entry.batter}</span> vs{" "}
              <span className="font-medium">{entry.bowler}</span>
              {" · "}
              <span>
                {entry.runs} run{entry.runs !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentaryFeed;
