import React, { useEffect } from "react";

// Declare Stripe Pricing Table custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string;
          'publishable-key': string;
        },
        HTMLElement
      >;
    }
  }
}

const ShopPage = () => {
  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <stripe-pricing-table 
        pricing-table-id="prctbl_1TnNRpEV0X4rFJV7EdfrXRD7"
        publishable-key="pk_live_51TnLhUEV0X4rFJV7jeQhI08g73xvCNKwaQT0lhQwHplZQ2C8WLV1vayOyr2JVQt9KXZq2PrZchMJ8xouLSMbB4ck00B0WazWQI">
      </stripe-pricing-table>
    </div>
  );
};

export default ShopPage;
