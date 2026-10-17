# தமிழ் நாட்காட்டி (Tamil calendar PWA)

Offline Tamil calendar for Chennai. Everything is calculated on the phone (Lahiri ayanamsa, IST).

- `data.js` — add muhurtham days and moon-sighting holidays (Ramzan, Bakrid etc.) each year.
- `sw.js` — bump `VERSION` after any change so the phone picks up the update.
- `engine.js` — all the astronomy and festival rules.

Deploy: push this folder to a GitHub repo, then Settings → Pages → Deploy from branch → main / root.
