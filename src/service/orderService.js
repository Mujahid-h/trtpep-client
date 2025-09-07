import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const API_BASE_URL = `${API}/api/order`;

export const confirmOrder = async (orderData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/confirm`, orderData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchOrders = async () => {
  try {
    const { data } = await axios.get(API_BASE_URL);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchOrderById = async (orderId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/${orderId}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // 🚨 no order found
    }
    throw error.response?.data || error.message;
  }
};

export const changePaymentStatus = async (orderId, status) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/payment/${orderId}`, {
      status,
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const changeApprovalStatus = async (
  orderId,
  status,
  rejectionReason = ""
) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/status/${orderId}`, {
      status,
      rejectionReason,
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendOrderRequest = async (orderId, status, callback_url) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/request`, {
      orderId,
      status,
      callback_url,
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
