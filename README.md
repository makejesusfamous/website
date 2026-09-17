# Make Jesus Famous — donor funnel (static)
Owner: Make Jesus Famous Ministries Inc (EIN 92-3637456). Built by R3dpill AI, Sept 2026, against Hermes' donor-engine storyboard (Dean blessed 9/4) and the 9/3 page order.

Hosting: MJF's own Netlify (Paul sets up) · plain full deploy from this repo · NEVER the Medicaid incremental deployer.
Domains: makejesusfamous.world (ads first) → makejesusfamous.com on Ad Grant approval.

## Pages (build order)
1. /partner — hero (11,082 pastors · 105K salvations · 774K reached), Dean hero video (VSL), 3 monthly tiers DEFAULT, thermometer, 0%-fee transparency block, Partner Path CTA
2. Partner Path survey (modal) → MW8 webhook, keepalive:true, routes by p_intent
3. /thank-you-gift · /thank-you-prayer (Dean welcome video, no ask, optional mailing address)
4. /smart-giving — stock / DAF / QCD in fifth-grade words, 15-min booking, EIN + legal name printed
5. /magazine — 4 fields max → tag magazine-subscriber

## Walls (contractual — do not cross)
- Per-channel Givebutter links ARE the 10% invoice; pastor lane has its own link we never touch or count
- Tags fire on the GIFT (Givebutter webhook), never on landing; pages set intent tags only
- Prayer is pastoral, never marketing; every thank-you ends "anything we can pray for?"; prayer data never in campaign copy
- Rule 20: dark until Dean flips it live
- SMS consent = two separate unchecked boxes (transactional / ministry updates), nonprofit A2P wording
- AI-voiced content announces itself as AI

## Plumbing
- Survey POST: https://services.leadconnectorhq.com/hooks/e4poIvyAFiLf6JN9ubzj/webhook-trigger/5cec18ae-dae2-449a-8390-361ea978b7d0
- Magazine POST: https://services.leadconnectorhq.com/hooks/e4poIvyAFiLf6JN9ubzj/webhook-trigger/48ea2b02-a549-4600-a2e2-04691349676e
- Payload keys: name,email,phone,address1,city,state,postal_code,p_interest,p_intent,p_vehicle,p_amount_band,p_source,prayer_request,utm_source,utm_medium,utm_campaign,utm_term,utm_content (+gclid)
- First-touch attribution: localStorage + cookie fallback, 90 days, first touch wins, hydrated into every POST and every Givebutter URL

## Decisions taken 9/17 (Joshua: "keep moving")
- Tiers built with PLACEHOLDERS on the agreed pattern ($39/mo trains a pastor / middle / major impact); swap Dean's names when r117 lands
- VSL = the /partner hero video; thank-you-prayer carries Dean's welcome video
- Build order as above; first /partner screens to Joshua before wiring
