import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Payment from "./components/Payment";
import Success from "./components/Success";
import Checkout from "./components/Checkout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
