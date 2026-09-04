# Animations — handoff folder

Everything in here is written to be **lifted out and given to the dev team**.
The rest of the prototype is throwaway; these files are not.

## Rules

- One file per animation. Name it for what it does.
- Each file is self-contained: markup + its own `<style>` (+ script if needed)
  and a comment saying where it's used. Copy one file, paste it, it works.
- No library, no build step, no external requests.
- `prefers-reduced-motion` handled inside the file itself.
- Open the file directly in a browser to preview it in isolation.

## Index

| File | What it does | Used on |
|------|--------------|---------|
| `ticker-telliskivi.html` | Seamless TELLISKIVI marquee. Uses the real exported strip, cropped to one 1435.87px period. Pauses on hover. | every page, `.hdr` |
| `logo_scroll.svg` | The designer's original strip export. Source file, not a snippet — kept here for reference. | — |
| `zigzag-draw.html` | Orange zigzag motif that draws itself on scroll-in. Large divider + small tab variant. | index (divider), contact block, tab nav |
