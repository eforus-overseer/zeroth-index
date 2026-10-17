# Contributing

Thanks for helping improve Zeroth Index. Start with a focused issue or pull request and explain the user problem it addresses.

## Taxonomy data

The entries in `docs/data/taxonomy.json` are adapted from the [Arcanum Prompt Injection Taxonomy](https://github.com/Arcanum-Sec/arc_pi_taxonomy) under CC BY 4.0. Keep the attribution and license notices. When proposing edits to reused entries, compare them with the source and say what changed. For new material, cite the research or primary source that supports it and label uncertainty.

Do not imply that a pairing created in the path builder is tested or endorsed. Add an explicit, sourced relationship only when there is evidence for that relationship.

## Site changes

Keep the site static and usable without a build step. Use semantic HTML, text labels, keyboard-accessible controls, and a reduced-motion state. Do not turn the reference into a scanner or attack runner without documenting the scope and validation method.

Before submitting:

```bash
npm test
node --check docs/app.js
```

For a visual change, check a wide desktop, tablet, and narrow phone viewport. Check that search, filters, entry details, path composition, and copying still work.
