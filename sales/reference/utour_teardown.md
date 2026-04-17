# UTour Competitive Teardown

## Overview
UTour (utourhomes.com) is the current market leader in self-guided tour software for homebuilders. They're our primary competitor.

## Their Pricing (from market intel)
- Not published — requires sales call
- Union Main Homes pays ~$15,000/month for ~70 properties (~$214/property/month)
- Two tiers: "Self-Tour Essential" and "Self-Tour Premium"
- Premium adds AI chatbot (AtlasRTX) and Alexa integration

## Their Strengths
- **Market presence** — established, known name in builder circles
- **Integrations** — Zillow, Realtor.com, NewHomeSource.com lead syndication
- **CRM integration** — pushes to builder's CRM
- **AtlasRTX partnership** — automated chatbot follow-up (Premium tier)
- **Amazon Alexa integration** — in-home voice experience (Premium tier)

## Their Weaknesses (our attack vectors)
1. **Price** — $214/property/month is expensive. At 70+ properties, builders feel the pain.
2. **Hardware complexity** — requires SmartThings hub + lock setup. Multiple points of failure. IT involvement.
3. **Middleware dependency** — Seam + SmartThings as lock middleware means two extra services between the software and the physical lock.
4. **Onboarding time** — weeks, not hours. Requires builder's team involvement.
5. **No direct AI** — their AI chatbot is a third-party add-on (AtlasRTX), not built-in. Extra cost on Premium tier.
6. **Generic technology** — not purpose-built for builders. It's a general self-tour platform adapted for new construction.
7. **No proprietary hardware** — they rely on off-the-shelf consumer smart home gear.

## What We Beat Them On
| Dimension | KeySherpa Advantage |
|---|---|
| Hardware | Purpose-built hub, ships ready, cellular (no WiFi needed) |
| Setup time | <1 hour vs. weeks |
| Lock control | Direct Z-Wave, no middleware |
| AI | Built-in Claude-powered SMS assistant on every plan |
| Cost | 30-50% lower per community |
| Reliability | Cellular (not WiFi dependent), hardware watchdog, auto-reconnect |

## What They Beat Us On (be honest)
| Dimension | UTour Advantage |
|---|---|
| Brand recognition | Established, builders know the name |
| Zillow/Realtor.com integration | Lead syndication partnerships we don't have yet |
| Amazon Alexa | Niche but some builders want in-home voice |
| Sales team | They have dedicated sales reps, we're founder-selling |

## How to Position Against Them
- Lead with **cost savings** — "How much is UTour charging you per community?"
- Follow with **simplicity** — "Our hardware plugs in. That's it. No SmartThings, no IT."
- Close with **AI** — "Every visitor gets an AI assistant during their tour, included in every plan"
- Don't attack their brand — respect the incumbent, position as the modern alternative

## Key Talking Points for Prospects Currently on UTour
1. "What's your effective cost per community with UTour right now?"
2. "How long did the initial setup take? How many people were involved?"
3. "Have you had issues with SmartThings hub connectivity?"
4. "Are you using their Premium tier for the AI chatbot? What's that adding to your bill?"
5. "If you could cut your per-community cost by 40% and get better AI built in, what would that free up?"
