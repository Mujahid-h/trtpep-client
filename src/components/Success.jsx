import React from "react";
import { CheckCircle } from "lucide-react";

const Success = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center border border-gray-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-red-500 animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful 🎉
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully! <br />
          You’ll receive updates about your delivery soon.
        </p>

        {/* CTA Buttons */}
        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-red-600 transition">
            View Order
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-300 transition">
            Continue Shopping
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Success;
