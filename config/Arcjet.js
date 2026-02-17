import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/next"

const isProd = process.env.NODE_ENV === "production";

// 🔐 Main Arcjet instance (Global protection)
export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // 🛡 Shield protection
    shield({
      mode: isProd ? "LIVE" : "DRY_RUN",
    }),

    // 🤖 Bot detection
    detectBot({
      mode: isProd ? "LIVE" : "DRY_RUN",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
  ],
});


// 💎 Free User Rate Limiter (3 req per minute)
export const freeUserLimiter = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    tokenBucket({
      mode: isProd ? "LIVE" : "DRY_RUN",
      characteristics: ["userId"], // must pass userId in protect()
      refillRate: 3,   // 3 per minute
      interval: 60,    // 60 seconds
      capacity: 5,     // max burst
    }),
  ],
});
