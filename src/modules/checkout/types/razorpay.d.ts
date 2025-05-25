interface RazorpayOptions {
  key: string | undefined;
  amount: string | number;
  currency: string;
  name: string;
  order_id: string;
  prefill: {
    email: string;
    name: string;
  };
  handler: () => void;
  modal: {
    ondismiss: () => void;
    escape: boolean;
    confirm_close: boolean;
  };
  theme: { color: string };
}

interface Razorpay {
  new (options: RazorpayOptions): {
    open: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: Razorpay;
  }
}
