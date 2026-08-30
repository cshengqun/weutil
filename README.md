# WeUtil

Free online developer toolbox. Works in the browser, no install needed.

## Tools

### JSON Lab
- Format & beautify JSON (2-space indent)
- Minify JSON to a single line
- Syntax validation with error line location
- Recursive alphabetical sorting of object keys
- Structured tree view (expand/collapse/search)
- Field details panel (click any object/array to inspect fields)
- Two-version JSON diff (added/removed/changed)
- Copy value / copy JSONPath
- Download as .json file
- Light/dark theme toggle

### Epoch Lab (Timestamp Converter)
- Timestamp to date conversion with auto precision detection (s/ms/µs/ns)
- Date & time to timestamp (s/ms/µs/ns)
- Local time and UTC display
- Multiple output formats (ISO 8601, RFC 2822, locale)
- Relative time display
- Live clock and Now shortcut (⌘/Ctrl + Enter)
- Custom timezone output (all IANA timezones)
- Light/dark theme toggle

## Live Site

🔗 https://weutil.top

## Tech Stack

- Pure static HTML/CSS/JS — no build tools, no frameworks, no dependencies
- Vercel for hosting and analytics
- Google Search Console for SEO

## Local Development

Just open `index.html` in any modern browser. No build step, no server needed.

## Deployment

Push to `main` branch → Vercel auto-deploys to https://weutil.top

## Project Structure

```
├── index.html      # JSON Lab (main page)
├── timestamp.html  # Epoch Lab (timestamp converter)
├── README.md
└── .gitignore
```

## License

MIT