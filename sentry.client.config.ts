import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://06a1423fa7256013175187bdbb092bfa@o4510729870966784.ingest.us.sentry.io/4510729876275200",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  // Boosted to 100% for hackathon demo - captures all user sessions
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
