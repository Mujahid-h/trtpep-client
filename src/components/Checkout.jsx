// import { useState, useEffect } from "react";
// import { confirmOrder, fetchOrderById } from "../service/orderService";
// import CryptoJS from "crypto-js";
// import PaymentCardComponent from "./Card";

// export default function Checkout() {
//   const [verifiedPayload, setVerifiedPayload] = useState(null);
//   const [order, setOrder] = useState(null);

//   function b64urlToUtf8(b64u) {
//     const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
//     const binary = atob(b64);
//     const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
//     return new TextDecoder().decode(bytes);
//   }

//   function generateHmac(rawJSON, secret) {
//     return CryptoJS.HmacSHA256(rawJSON, secret).toString(CryptoJS.enc.Hex);
//   }

//   // Step 1: Verify payload on mount
//   useEffect(() => {
//     const verifyCheckout = async () => {
//       const params = new URLSearchParams(window.location.search);
//       const payloadB64 = params.get("payload");
//       const sig = params.get("sig");

//       if (!payloadB64 || !sig) return;

//       try {
//         const rawJSON = b64urlToUtf8(payloadB64);

//         console.log("Payload received from WooCommerce:", JSON.parse(rawJSON));

//         const hash = generateHmac(rawJSON, import.meta.env.VITE_SITE_SECRET);

//         if (hash === sig) {
//           const parsed = JSON.parse(rawJSON);
//           setVerifiedPayload(parsed);
//         } else {
//           console.error("Invalid signature. Payload not trusted!");
//         }
//       } catch (error) {
//         console.error("Error verifying checkout:", error);
//       }
//     };

//     verifyCheckout();
//   }, []);

//   // Step 2: Ensure order exists in DB
//   useEffect(() => {
//     const ensureOrder = async () => {
//       if (!verifiedPayload) return;

//       try {
//         // Try to fetch the order by ID
//         const existing = await fetchOrderById(verifiedPayload.order.id);

//         if (existing?.order) {
//           // ✅ Already exists in DB
//           setOrder(existing.order);
//         } else {
//           // ❌ Not found → create it
//           const created = await confirmOrder(verifiedPayload);
//           setOrder(created?.order);
//         }
//       } catch (err) {
//         console.error("Error ensuring order:", err);
//       }
//     };

//     ensureOrder();
//   }, [verifiedPayload]);

//   // Step 3: Get phone details iso and corrected format
//   useEffect(() => {
//     const updatedPhoneDetails = getPhoneDetails(
//       order?.contact_number,
//       order?.country
//     );
//   }, [verifiedPayload]);

//   // step 4: Ready the payload to be sent to payment gateway
//   const payloadForGateway = {
//     title: `Iniating payment for order ${order?.id}`,
//     description: `Payment for order ${order?.id} from WooCommerce store`,
//     image:
//       "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcufNYNvEcgl2Nr-ah4bq0ojLfexrozX7jGA&s",
//     customer: {
//       first_name: order?.customer?.firstName,
//       last_name: order?.customer?.lastName,
//       email: order?.customer?.email,
//       ip_address: order?.ip_address,
//       phone: updatedPhoneDetails?.formatted,
//       phone_iso2: updatedPhoneDetails?.countryISO,
//     },
//     billing_address: {
//       country: order?.country,
//       state: order?.state,
//       city: order?.city,
//       address: order?.address1,
//       postal_code: order?.postal_code,
//     },
//     amount: order?.order_total,
//     currency: order.currency,
//     external_reference: `order_${order?.order?.id}`,
//     callback_url: order?.callback_url,

//     metadata: {
//       order_id: `ORDER_${order?.order?.id}`,
//       customer_type: "returning",
//       product_category: "medicine",
//     },
//   };

//   return <PaymentCardComponent order={order} />;
// }

import { useState, useEffect } from "react";
import { confirmOrder, fetchOrderById } from "../service/orderService";
import CryptoJS from "crypto-js";
import PaymentCardComponent from "./Card";
import getPhoneDetails from "../utils/phoneUtil";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const [verifiedPayload, setVerifiedPayload] = useState(null);
  const [order, setOrder] = useState(null);
  const [phoneDetails, setPhoneDetails] = useState(null);
  const navigate = useNavigate();

  function b64urlToUtf8(b64u) {
    const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function generateHmac(rawJSON, secret) {
    return CryptoJS.HmacSHA256(rawJSON, secret).toString(CryptoJS.enc.Hex);
  }

  // Step 1: Verify payload
  useEffect(() => {
    const verifyCheckout = () => {
      const params = new URLSearchParams(window.location.search);
      const payloadB64 = params.get("payload");
      const sig = params.get("sig");
      if (!payloadB64 || !sig) return;

      try {
        const rawJSON = b64urlToUtf8(payloadB64);
        // console.log("Payload received from WooCommerce:", JSON.parse(rawJSON));
        const hash = generateHmac(rawJSON, import.meta.env.VITE_SITE_SECRET);
        if (hash === sig) {
          const parsed = JSON.parse(rawJSON);
          setVerifiedPayload(parsed);
        } else {
          console.error("Invalid signature!");
        }
      } catch (err) {
        console.error("Error verifying checkout:", err);
      }
    };

    verifyCheckout();
  }, []);

  // Step 2: Ensure order in DB
  useEffect(() => {
    const ensureOrder = async () => {
      if (!verifiedPayload) return;
      try {
        const existing = await fetchOrderById(verifiedPayload.order.id);
        if (existing?.order) {
          const createdAt = new Date(existing?.order?.createdAt).getTime();
          const expiryTime = createdAt + 2 * 60 * 60 * 1000; // +2h
          if (Date.now() > expiryTime) {
            navigate("/failure");
          }
          setOrder(existing.order);
        } else {
          const created = await confirmOrder(verifiedPayload);
          setOrder(created?.order);
        }
      } catch (err) {
        console.error("Error ensuring order:", err);
      }
    };
    ensureOrder();
  }, [verifiedPayload]);

  // // Step 2: Ensure order in DB
  // useEffect(() => {
  //   const ensureOrder = async () => {
  //     if (!verifiedPayload) return;
  //     try {
  //       const existing = await fetchOrderById(verifiedPayload.order.id);
  //       const currentOrder = existing?.order
  //         ? existing.order
  //         : (await confirmOrder(verifiedPayload))?.order;

  //       if (currentOrder) {
  //         // ⏳ Check expiry on frontend (2 hours)
  //         const createdAt = new Date(currentOrder.createdAt).getTime();
  //         const expiryTime = createdAt + 2 * 60 * 60 * 1000; // +2h
  //         if (Date.now() > expiryTime) {
  //           navigate("/failure"); // redirect if expired
  //         } else {
  //           setOrder(currentOrder);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error ensuring order:", err);
  //     }
  //   };
  //   ensureOrder();
  // }, [verifiedPayload, navigate]);

  // Step 3: Extract phone details form helper

  useEffect(() => {
    if (verifiedPayload?.contact_number && verifiedPayload?.country) {
      const details = getPhoneDetails(
        verifiedPayload.contact_number,
        verifiedPayload.country
      );
      setPhoneDetails(details);
    }
  }, [verifiedPayload]);

  // Step 4: Build payload for payment gateway
  const payloadForGateway = verifiedPayload && {
    title: "Initiating payment",
    description: "Testing the payment API call",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcufNYNvEcgl2Nr-ah4bq0ojLfexrozX7jGA&s",
    customer: {
      first_name: verifiedPayload.customer?.first_name,
      last_name: verifiedPayload.customer?.last_name,
      email: verifiedPayload.customer?.email,
      ip_address: verifiedPayload.ip_address,
      phone: phoneDetails?.formatted?.number,
      // phone: phoneDetails?.formatted?.number,
      phone_iso2: phoneDetails?.countryISO,
    },
    billing_address: {
      country: verifiedPayload.country,
      state: verifiedPayload.state,
      city: verifiedPayload.city,
      address: verifiedPayload.address_1,
      postal_code: verifiedPayload.postal_code,
    },
    amount: String(Math.round(verifiedPayload.order_total * 100)),
    currency: verifiedPayload.currency,
    // external_reference: `order_${verifiedPayload.order.id}`,
    external_reference: verifiedPayload.order.id,
    callback_url: verifiedPayload.callback_url,
    metadata: {
      order_id: `ORDER_${verifiedPayload.order.id}`,
      customer_type: "returning",
      product_category: "medicine",
    },
    // The card details will be filled in the PaymentCardComponent
  };

  return <PaymentCardComponent payload={payloadForGateway} />;
}
