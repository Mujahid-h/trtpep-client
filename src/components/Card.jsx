import React, { useState } from "react";
import { CreditCard, Lock, Calendar } from "lucide-react";
import trtpep from "../assets/TRTPEP-LOGO.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  changeApprovalStatus,
  changePaymentStatus,
  sendOrderRequest,
} from "../service/orderService";

export default function PaymentCardComponent({ payload }) {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cvv: "",
    expiry: "",
    cardholderName: "",
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [focusedField, setFocusedField] = useState("");

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, "").length > 16) return;
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    } else if (field === "expiry") {
      formattedValue = formatExpiry(value);
      if (formattedValue.length > 5) return;
    }

    setCardData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!cardData.cardNumber || !cardData.cvv || !cardData.expiry) {
      alert("Please fill in all card details.");
      setIsLoading(false);
      return;
    }

    const paymentPayload = {
      ...payload,
      card: {
        card_number: cardData.cardNumber.replace(/\s/g, ""),
        cvv: cardData.cvv,
        expire: cardData.expiry,
      },
    };

    try {
      const res = await axios.post(
        "https://stratospay.com/api/v1/charge-card",
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );

      // if (res?.data?.status === "success") {
      //   // ✅ Success → send paid
      //   const response = await sendOrderRequest(
      //     payload.external_reference,
      //     "paid",
      //     payload.callback_url
      //   );

      //   if (response?.data?.success) {
      //     localStorage.removeItem("paymentAttempts");
      //     setIsLoading(false);
      //     navigate("/success");
      //   }
      //   return; // stop here
      // }

      if (res?.data?.status === "success") {
        const response = await changePaymentStatus(
          payload.external_reference,
          "completed"
        );

        if (response?.success) {
          localStorage.removeItem("paymentAttempts");
          setIsLoading(false);
          navigate("/success");
        }
        return;
      }

      // ❌ Payment declined (status !== success)
      await handleFailedAttempt();
      // setIsLoading(false);
    } catch (error) {
      // ❌ API/network error
      await handleFailedAttempt();
      // setIsLoading(false);
    }
  };

  // Helper function for failed attempts
  const handleFailedAttempt = async () => {
    const currentAttempts = Number(
      localStorage.getItem("paymentAttempts") || 0
    );
    const newAttempts = currentAttempts + 1;
    localStorage.setItem("paymentAttempts", newAttempts);

    if (newAttempts >= 8) {
      console.log("Maximum payment attempts reached. Marking order as failed.");

      try {
        await sendOrderRequest(
          payload.external_reference,
          "failed",
          payload.callback_url
        );

        await changePaymentStatus(payload.external_reference, "failed");
        await changeApprovalStatus(payload.external_reference, "incomplete");
        localStorage.removeItem("paymentAttempts");
        alert("You have used all 8 attempts. Order marked as failed.");
      } catch (err) {
        console.error("Error sending failed order request:", err);
      }
    } else {
      console.log(`Payment failed. Attempt ${newAttempts} of 8.`);
    }
  };

  const getCardType = (number) => {
    const num = number.replace(/\s/g, "");
    if (num.startsWith("4")) return "visa";
    if (num.startsWith("5") || num.startsWith("2")) return "mastercard";
    if (num.startsWith("3")) return "amex";
    return "generic";
  };

  const CardLogo = ({ type }) => {
    const logos = {
      visa: (
        <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
          VISA
        </div>
      ),
      mastercard: (
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-500 rounded-full opacity-80"></div>
          <div className="w-6 h-6 bg-yellow-500 rounded-full -ml-3 opacity-80"></div>
        </div>
      ),
      amex: (
        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
          AMEX
        </div>
      ),
      generic: <CreditCard className="w-6 h-6 text-gray-400" />,
    };
    return logos[type] || logos.generic;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div>
        <img
          src={trtpep}
          alt=""
          className="w-24 h-24 object-cover absolute top-8 left-8"
        />
      </div>
      <div className="max-w-md w-full ">
        {/* Card Preview */}
        <div className="relative mb-8 perspective-1000">
          <div
            className={`relative w-full h-56 rounded-2xl transition-transform duration-700 transform-style-preserve-3d ${
              focusedField === "cvv" ? "rotate-y-180" : ""
            }`}
          >
            {/* Card Front */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl backface-hidden border border-gray-700">
              <div className="p-6 h-full flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-80"></div>
                  <CardLogo type={getCardType(cardData.cardNumber)} />
                </div>

                <div className="space-y-4">
                  <div className="text-lg font-mono tracking-wider">
                    {cardData.cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        CARDHOLDER NAME
                      </div>
                      <div className="text-sm font-medium">
                        {cardData.cardholderName || "YOUR NAME"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">EXPIRES</div>
                      <div className="text-sm font-mono">
                        {cardData.expiry || "MM/YY"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Back */}
            <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl rotate-y-180 backface-hidden border border-gray-700">
              <div className="p-6 h-full">
                <div className="w-full h-12 bg-black mt-4 mb-6"></div>
                <div className="flex justify-end">
                  <div className="bg-white px-3 py-1 rounded text-black font-mono text-right min-w-16">
                    {cardData.cvv || "CVV"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black  backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center mb-6">
            <Lock className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-white text-sm">Secure Payment</span>
          </div>

          <div className="space-y-4">
            {/* Cardholder Name */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardData.cardholderName}
                onChange={(e) =>
                  handleInputChange("cardholderName", e.target.value)
                }
                onFocus={() => setFocusedField("cardholderName")}
                onBlur={() => setFocusedField("")}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300"
              />
            </div>

            {/* Card Number */}
            <div className="relative">
              <input
                type="text"
                placeholder="Card Number"
                value={cardData.cardNumber}
                onChange={(e) =>
                  handleInputChange("cardNumber", e.target.value)
                }
                onFocus={() => setFocusedField("cardNumber")}
                onBlur={() => setFocusedField("")}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 font-mono"
              />
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            </div>

            {/* CVV and Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => handleInputChange("expiry", e.target.value)}
                  onFocus={() => setFocusedField("expiry")}
                  onBlur={() => setFocusedField("")}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 font-mono"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  onFocus={() => setFocusedField("cvv")}
                  onBlur={() => setFocusedField("")}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 font-mono"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full mt-6 bg-red-500  hover:bg-red-600 disabled:bg-gray-200 disabled:text-red-500 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-lg"
            >
              Complete Payment
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
