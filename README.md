# odddayevenday

Simple single-page app that shows:
- Today's date
- Whether today is an odd/even/other school day
- The next school day and whether it is odd/even/other

## Widget
The frameless, compact view lives at `/widget` when `src` is deployed as the site's static root:

```text
https://odddayevenday.com/widget
```

It is designed to embed directly in Mango Display and shows today's schedule alongside the next school day.

## Files
- `index.html`: page markup
- `widget/index.html`: compact widget markup
- `styles.css`: simple styling
- `schedule-data.js`: your calendar data and rules
- `app.js`: display and odd/even logic

## Run Locally
Open `index.html` in a browser.

## Update Schedule Data
Edit `schedule-data.js`:
- `timezone`: school timezone, currently `America/Denver`
- `days`: base school dates from the official calendar (`odd`, `even`, `other`, or object with a note)
- `overrides`: date-specific replacement parity
- `canceledDays`: dates with no school
- `shiftRules`: future parity shifts (for example after cancellations)

Example day entries:

```js
days: {
	"2026-08-24": "odd",
	"2026-08-25": "even",
	"2026-08-26": "other",
	"2026-08-27": { type: "other", note: "Assembly schedule" }
}
```

Example shift rule:

```js
shiftRules: [
	{ from: "2026-12-11", delta: 1, reason: "Snow day shift" }
]
```

If `delta` is odd, odd/even flips for all mapped dates on and after `from`.