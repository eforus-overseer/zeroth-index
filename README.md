# Zeroth Index

**Map the attack paths.** Zeroth Index is a searchable field reference for prompt-injection patterns. It organizes entries by the result an attacker wants, the technique they use, how they may evade filters, and where the instruction enters.

The site is an independent interface and planning aid built around attributed source data. It does not scan prompts, run attacks, validate combinations, or certify a system as safe.

**[Open the interactive index](https://eforus-overseer.github.io/zeroth-index/)** · **[Browse the data](docs/data/taxonomy.json)** · **[Read data attribution](DATA-ATTRIBUTION.md)**

## Explore the index

- Search all entries by title, reference code, description, alias, idea, or example.
- Filter by the four lenses and by direct, indirect, either, or local access.
- Open an entry to read its description, aliases, ideas, and example prompts.
- Compose a draft test hypothesis by choosing an item from each lens, then copy it into a review note.

The path builder combines entries for a human to assess. The source taxonomy does not claim that any arbitrary combination is a validated attack chain.

## The four lenses

| Lens | Question | Entries |
| --- | --- | ---: |
| Intents | What does the attacker want? | 27 |
| Techniques | How is the model manipulated? | 70 |
| Evasions | How might a payload get past filters? | 63 |
| Inputs | Where does the instruction arrive? | 12 |

Entries carry stable `PIT-*` reference codes and may map to aliases used by other frameworks. `LOCAL` identifies techniques that need access to model weights or internals and therefore do not apply to a black-box hosted API.

## Run locally

The site uses plain HTML, CSS, JavaScript, and JSON; it has no runtime packages.

```bash
python3 -m http.server 5173 --directory docs
```

Open <http://localhost:5173>. The page fetches its JSON data, so it needs to be served over HTTP rather than opened directly as a file.

Validate the data and JavaScript before submitting a change:

```bash
npm test
node --check docs/app.js
```

GitHub Actions deploys the `docs/` directory to GitHub Pages from `main`.

## Data and attribution

The taxonomy data in `docs/data/taxonomy.json` is adapted from the [Arcanum Prompt Injection Taxonomy](https://github.com/Arcanum-Sec/arc_pi_taxonomy), by Jason Haddix and Arcanum Information Security. That data is available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and is attributed in the site footer and [DATA-ATTRIBUTION.md](DATA-ATTRIBUTION.md). Zeroth Index’s interface and original code are MIT licensed; these separate licenses are not a relicensing of the source taxonomy.

The four historical celestial maps in `docs/assets/` are public-domain works from Wikimedia Commons. The charts section also includes the optional, user-controlled “ESOcast 200 Light” clip by the European Southern Observatory (CC BY 4.0). Image and video credits and source pages are listed in `docs/assets/credits.json` and on the site.

## Project limits

This is a reference catalog, not an empirical benchmark or a defense. Its entries and examples are not necessarily exhaustive, independently tested, or linked to every other entry. Use the taxonomy to structure human-led assessment, then validate claims against the system and threat model under review.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes to the reused taxonomy must preserve source attribution and CC BY 4.0 terms. Please distinguish verified relationships from analyst hypotheses and keep the UI's limits visible.

## License

Original Zeroth Index code is released under the MIT License. Reused taxonomy data and archival images have the separate terms described above and in [DATA-ATTRIBUTION.md](DATA-ATTRIBUTION.md).


<!-- codex-pixel-art -->
## Project visual

![Pixel-art cover for zeroth-index](assets/project-cover.png)

<sub>Pixel-art adaptation of [OpenMoji card index](https://github.com/hfg-gmuend/openmoji/blob/master/color/618x618/1F4C7.png) by OpenMoji contributors, licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Source: OpenMoji.</sub>
