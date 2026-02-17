"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/shared/AiModelsShared";
import { Check, Loader2, Zap } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";

function PaymentModal({ open, onClose }) {
  const { user } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePayment = async (plan) => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      alert("Please sign in to purchase a plan");
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      // Create order
      const orderResponse = await axios.post("/api/payment/create-order", {
        amount: plan.price,
        planName: plan.name,
        userEmail: user.primaryEmailAddress.emailAddress,
      });

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          order_id: orderId,
          name: "AI Webnar",
          description: `${plan.name} Plan Subscription`,
          image: "/logo.svg",
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await axios.post("/api/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail: user.primaryEmailAddress.emailAddress,
                planName: plan.name,
                credits: plan.credits,
              });

              if (verifyResponse.data.success) {
                // Update local user context
                setUserDetail((prev) => ({
                  ...prev,
                  credits: (prev?.credits || 0) + plan.credits,
                  plan: plan.name,
                }));
                alert("Payment successful! Credits added to your account.");
                onClose();
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user.fullName || "",
            email: user.primaryEmailAddress.emailAddress,
          },
          theme: {
            color: "#7c3aed",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setSelectedPlan(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        alert("Failed to load payment gateway. Please try again.");
        setLoading(false);
        setSelectedPlan(null);
      };
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.error || "Failed to initiate payment");
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const plans = [
    PRICING_PLANS.FREE,
    PRICING_PLANS.PRO,
    PRICING_PLANS.ENTERPRISE,
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Upgrade to unlock more features and AI models
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative border rounded-xl p-6 flex flex-col ${
                plan.name === "Pro"
                  ? "border-purple-500 ring-2 ring-purple-500"
                  : "border-gray-200"
              }`}
            >
              {plan.name === "Pro" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">Rs.{plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-6 w-full ${
                  plan.name === "Pro"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : plan.name === "Free"
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
                onClick={() => handlePayment(plan)}
                disabled={loading || plan.price === 0}
              >
                {loading && selectedPlan?.name === plan.name ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : plan.price === 0 ? (
                  "Current Plan"
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;