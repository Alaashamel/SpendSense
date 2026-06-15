# SpendSense: Intelligent Expense Visualizer
# Try it from here => 
https://spend-sense-chi-nine.vercel.app/

A frontend financial dashboard built with HTML, CSS, and vanilla JavaScript. It transforms raw expense data into category reports, CSS bars, SVG donut charts, and budget insights.

## Features
- Add, search, filter, and delete expenses.
- Weekly / monthly / all-time reporting.
- Category aggregation with `.reduce()`, `.filter()`, and `.map()`.
- Dynamic SVG donut chart without external chart libraries.
- Budget progress meter and financial insights.
- CSV export and LocalStorage persistence.

## Challenges & Solutions
- **Floating point totals:** totals are normalized with `Number(...toFixed(2))` to avoid inaccurate financial output.
- **Chart rendering without libraries:** SVG circles use `stroke-dasharray` and `stroke-dashoffset` to create a lightweight donut chart.
- **Reactive updates:** every create/delete/filter action re-computes aggregates and re-renders only the needed UI sections.

## Tech
HTML, CSS, JavaScript, LocalStorage, SVG, Array methods.
