import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
  const orderDetails = localStorage.getItem("currentOrder");
  const order = JSON.parse(orderDetails);

  console.log("Order Here: ", order);

  const [form, setForm] = useState({
    first_name: order.customer.first_name || "",
    last_name: order.customer.last_name || "",
    email: order.customer.email || "",
    ip_address: "",
    phone: "+14372384288",
    phone_iso2: "US",
    billing_address: {
      country: "",
      state: "",
      city: "",
      address: "",
      postal_code: "",
    },
    card: {
      card_number: "",
      cvv: "",
      expire: "",
    },
    amount: order?.total_order_value,
    // amount: 0,
    currency: order.currency,
    external_reference: order?._id || `txn_${Date.now()}`,
    callback_url: `${window.location.origin}/success`,
    plan_id: "",
    account_id: "0497287",
    metadata: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("billing_address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [field]: value,
        },
      }));
    } else if (name.includes("card.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        card: {
          ...prev.card,
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      customer: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        ip_address: form.ip_address,
        phone: form.phone,
        phone_iso2: form.phone_iso2,
      },

      billing_address: {
        country: form.billing_address.country,
        state: form.billing_address.state,
        city: form.billing_address.city,
        address: form.billing_address.address,
        postal_code: form.billing_address.postal_code,
      },

      card: {
        cvv: form.card.cvv,
        card_number: form.card.card_number,
        expire: form.card.expire,
      },

      amount: Number(form.amount),
      currency: form.currency,
      external_reference: form.external_reference,
      callback_url: form.callback_url,
      plan_id: form.plan_id,
      account_id: form.account_id,
      metadata: form.metadata,
    };

    // const payload = {
    //   customer: [
    //     form.first_name,
    //     form.last_name,
    //     form.email,
    //     form.ip_address,
    //     form.phone,
    //     form.phone_iso2,
    //   ],
    //   billing_address: [
    //     form.billing_address.country,
    //     form.billing_address.state,
    //     form.billing_address.city,
    //     form.billing_address.address,
    //     form.billing_address.postal_code,
    //   ],
    //   card: [form.card.card_number, form.card.cvv, form.card.expire],
    //   amount: Number(form.amount),
    //   currency: form.currency,
    //   external_reference: form.external_reference,
    //   callback_url: form.callback_url,
    //   plan_id: form.plan_id,
    //   account_id: form.account_id,
    //   metadata: form.metadata,
    // };

    console.log("Payment Payload:", payload);

    try {
      const res = await axios.post(
        "https://stratospay.com/api/v1/charge-card",
        payload,
        {
          headers: {
            Authorization: "Bearer 7ohfhVAnqYmy8tMEJdlXsq7yZZZtAo",
          },
        }
      );
      console.log("Payment response: ", res.data);
      // navigate("/payment-success", { state: { order, payment: data } });
    } catch (error) {
      console.error("Payment failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Payment Page</h2>

      {order ? (
        <p className="mb-4 text-gray-600 text-center">
          Paying for Order{" "}
          <span className="font-semibold">#{order.merchant_order_id}</span> •{" "}
          <span className="font-semibold">${order.total_order_value}</span>
        </p>
      ) : (
        <p className="mb-4 text-red-500 text-center">⚠️ No order found</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="phone"
            placeholder="Phone (+14372384288)"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="phone_iso2"
            placeholder="Phone ISO2 (US)"
            value={form.phone_iso2}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <input
          type="text"
          name="ip_address"
          placeholder="IP Address (e.g. 192.168.1.1)"
          value={form.ip_address}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />

        {/* Billing Info */}
        <h3 className="font-semibold mt-4">Billing Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="billing_address.country"
            placeholder="Country (US)"
            value={form.billing_address.country}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="billing_address.state"
            placeholder="State"
            value={form.billing_address.state}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <input
          type="text"
          name="billing_address.city"
          placeholder="City"
          value={form.billing_address.city}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          name="billing_address.address"
          placeholder="Street Address"
          value={form.billing_address.address}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          name="billing_address.postal_code"
          placeholder="Postal Code"
          value={form.billing_address.postal_code}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />

        {/* Card Info */}
        <h3 className="font-semibold mt-4">Card Information</h3>
        <input
          type="text"
          name="card.card_number"
          placeholder="Card Number"
          value={form.card.card_number}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="card.cvv"
            placeholder="CVV"
            value={form.card.cvv}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="card.expire"
            placeholder="Expiry (MM/YY)"
            value={form.card.expire}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Amount */}
        <div className="mt-4">
          <label className="block font-semibold">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            readOnly
            className=""
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default PaymentPage;
