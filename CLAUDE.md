# CLAUDE.md

## What this is

A school documentary project (interaction design, worth 30%). It tells my father's real refugee story as an interactive website, which I then screen-record as the final MP4.

His story matches the documented August 1986 event: 155 Tamil refugees left Brake, West Germany, on the cargo ship MV Aurigae, were put into two lifeboats off Newfoundland (no source found for the often-quoted "200 miles"), drifted for days (he says three), and were rescued near St. Shott's on August 11, 1986. He travelled alone.

## Assignment requirements

- Final delivery: Full HD (1920×1080) MP4, 3.5–5 minutes, made by screen-recording this site.
- A PDF of process work is also due, with MLA, APA or Chicago citations for all non-original material, including sound effects.

## Design decisions (keep these unless I say otherwise)

- **Fully dark page.** Black background, no grid lines, no textures.
- **One dotted line**, no characters or vehicles riding it. It starts top left and zigzags down the page: stops alternate left and right. The dashes appear **one at a time, slowly** (`DASH_MS` in `js/story.js`), and the page scrolls to follow the newest dash. Reference: the dotted-map animation in the Emperor's New Groove.
- **Drawings:** my PNGs in `img/` (cropped from the originals). A plane drawing pops in beside the middle of the Sri Lanka → Germany line; it is decoration, not a stop. The Aurigae → lifeboat stretch is cut short to 5 dashes.
- **No story-structure labels on screen** (no "Exposition", "Climax" etc.). The structure lives in my treatment only.
- **Sound:** a quiet cinematic soundscape plays from the start; at the lifeboats it crossfades to crashing waves. When a card is open the background drops low (`CARD_DUCK`) so his voice leads. In the drift and beacon only the sonar plays (`sfx/sonar.mp3`), once every 10 s while the line fades; once they're found it goes back to the soundscape. Files are in `sfx/`, volumes in `js/story.js`. No other sound effects unless I ask.
- **Climax:** in the lifeboat section the line slows, fades and stops. Only a pulsing amber beacon is left. The viewer keeps it alive (click, hold Space, scroll) until the rescue, then the line continues to the Canadian flag.
- **Ending:** a darker note. They were let in on one-year permits, but their status was undecided, some media called them bogus, and a year later Canada moved to tighten the law.

## Facts and accuracy

- This is a documentary. Every fact on screen needs a source in `SOURCES` in `js/story.js`. Don't add facts without one.
- Never invent or exaggerate details of his story. Anything that comes from his interview is marked "To add" until I fill it in.
- Lines from his interview (quotes, stamps) are cited to the `interview` source.
- If he says one thing and officials or the press say another, don't put the official version on screen to correct him.
- Genocide framing: state what Canada's Parliament recognized (May 18, 2022 motion). Sri Lanka's government rejects the designation.

## Code

- Plain HTML, CSS and JavaScript. No frameworks, no build step, no npm. Keep it that way.
- `js/story.js` holds content and settings; `js/main.js` the engine. Keep content out of `main.js`.
- Background sounds and the sonar are files in `sfx/`.
- Test with Live Server; audio files don't load reliably from `file://`.
