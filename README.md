# Site Explorer: Challenge 3 starter

**How does this project get funded?**

A starter for [Build for Good: AI Lab for Housing](https://gdgpvd.dev/housing-jam) (DevFest Providence 2026). It is [Site Explorer](https://github.com/GDG-PVD/housing-site-explorer) with the Challenge 3 tab already built, so your team starts from a working tab and spends the afternoon making it better.

## What's already built

- A "Find funding programs" button: Gemini lists programs that could fund affordable housing at this site, with who runs each, who can apply, roughly how much, the next deadline and a link to the source page. Anything it is not sure of says "Check the source", and every source link is checked before it is shown: a link that does not load is dropped.
- A funding gap calculator: enter the total project cost and an amount for each source, tick the ones to count, and see the remaining gap. It is plain arithmetic, works without Gemini, and is tested (`npm test`).

Below the map, amenities, zoning link and summary, the new tab is at the bottom of the page. The code is in `challenge.ts` (the `/api/funding` endpoint and its Gemini prompt), `src/components/ChallengePanel.tsx` (the tab) and `src/fundingGap.ts` (the calculator math).

## Start

1. Click **Use this template** (top right on GitHub) to make your team's own copy, then clone it.
2. Run it:

   ```
   npm install
   npm run dev
   ```

3. Put `GEMINI_API_KEY` and `GOOGLE_MAPS_API_KEY` in a `.env.local` file (it is never committed). Open http://localhost:3000, explore an address, and scroll to the Challenge 3 tab.

Working in Google AI Studio instead of an editor? [Remix Site Explorer](https://ai.studio/apps/fcbdfa66-237e-4e2a-b5b4-090284f9d4bc) and use the Challenge 3 prompt cards on [gdgpvd.dev/housing-jam](https://gdgpvd.dev/housing-jam). This repo is for teams who want their own code.

## Your Google Maps key

The app hands the Maps key to the browser to draw the map, so anyone who opens a shared copy can read it. The server also uses the same key to look up addresses and nearby places, so do not restrict it to your app's website: Google refuses website-restricted keys on server calls, and address search would fail while the map still draws. Instead, in the Google Cloud console (APIs & Services, then Credentials, then your key), restrict it to the Maps JavaScript, Geocoding, Places API (New) and Places APIs, set a low daily quota on each of those APIs, and delete the key after the event. Never paste a key into a chat or commit one.

## Keep going

Prompts to try next, in AI Studio or with your coding assistant:

1. "Save the calculator for each address, so it is still there when I reload."
2. "Add a chart showing each funding source as a share of the total cost."
3. "Add a deadline column to the calculator and sort sources by the nearest deadline."
4. "When I pick a language in the summary card, translate the Funding tab too. Keep program names, dollar amounts and links as they are."

## Submit

Submit your team's app by 3:15 at [gdgpvd.dev/housing-jam](https://gdgpvd.dev/housing-jam): a screenshot and the link to your app or repo. One person submits for the whole team.

## The fine print

Everything Gemini drafts here is a starting point, not a zoning determination, legal advice or a funding commitment. Check with the town and the program.

Licensed under the [MIT License](LICENSE).
