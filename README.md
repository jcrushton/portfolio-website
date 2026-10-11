# portfolio-website
Instructional Design professional portfolio website for Jamie Rushton, served by GitHub Pages.

## What's here

- `index.html` – homepage (hero, featured project, skills, how I use AI, contact)
- `case-study.html` – Fourth Wish Animal Adoption case study
- `sandbox/` – the Adoption Desk, a playable practice CRM with a guided walkthrough
- `css/`, `js/`, `assets/` – shared styles, the contact form and theme toggle scripts, portrait and favicon

It's plain HTML, CSS and JavaScript with no build step. GitHub Pages serves the files as they are.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publishing

Settings → Pages → Build and deployment: Source **Deploy from a branch**, Branch **main**, folder **/ (root)**.
The site appears at https://jcrushton.github.io/portfolio-website/.

## Notes

- The contact form opens the visitor's email app with the note pre-filled, since GitHub Pages has no server to receive form posts.
- The testimonials section is in `index.html` but commented out until real quotes are ready.
- Dark mode: the sun/moon button at the top right switches themes and remembers the choice. Until a visitor picks one, the site follows their system setting. Dark colors live in `:root[data-theme="dark"]` at the top of `css/style.css`. The sandbox keeps its own light look.
