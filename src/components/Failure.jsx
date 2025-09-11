import React from "react";
import { XCircle } from "lucide-react";

const Failure = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center border border-gray-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <XCircle className="h-20 w-20 text-red-500 animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Failed ❌
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed. <br />
       
        </p>

        {/* CTA Buttons */}
        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-red-600 transition">
            Retry Payment
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-300 transition">
            Go Back
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Failure;
