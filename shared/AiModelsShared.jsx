export const DefaultModel = {
  GPT: {
    modelId: "gpt-4.1-mini",
    enable: true
  },
  Gemini: {
    modelId: "gemini-2.5-flash-lite",
    enable: true
  },
  DeepSeek: {
    modelId: "DeepSeek-r1",
    enable: true
  },
}

export const PRICING_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    credits: 100,
    messages: 5,
    features: [
      "5 messages per day",
      "Access to basic AI models",
      "Standard response time",
    ]
  },
  PRO: {
    name: "Pro",
    price: 299,
    priceId: "pro_monthly",
    credits: 1000,
    messages: 100,
    features: [
      "100 messages per day",
      "Access to all AI models",
      "Priority response time",
      "Advanced models access",
    ]
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 999,
    priceId: "enterprise_monthly",
    credits: 5000,
    messages: 500,
    features: [
      "Unlimited messages",
      "All AI models access",
      "Fastest response time",
      "API access",
      "Priority support",
    ]
  }
}
