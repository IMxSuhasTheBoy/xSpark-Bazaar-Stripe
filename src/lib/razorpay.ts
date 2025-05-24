import Razorpay from "razorpay";
/*
  This file initializes and exports a configured Razorpay client
  instance for backend to securely interact with the Razorpay API.

  usage:
  - Create payment orders
  - Handle refunds
  - Fetch payment details, etc.
*/
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
