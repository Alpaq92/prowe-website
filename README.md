# Prowe website

The public website of Prowe, a platform of modules for law firms and legal departments.

**Live:** [alpaq92.github.io/prowe-website](https://alpaq92.github.io/prowe-website/) · **Admin:** [/admin/](https://alpaq92.github.io/prowe-website/admin/)

Plain HTML, CSS and JavaScript, edited with [Sveltia CMS](https://sveltiacms.app) (MIT).
No framework, no build step, no server.

```
index.html          page shell, light/dark/system switch
app.js              renders content/<locale>.json in the browser
style.css
content/pl.json     all site content, Polish
content/en.json     all site content, English
admin/              Sveltia CMS: index.html + config.yml
vendor/marked/      marked 18.0.14 with its licence, served from the site
images/og.png       link-preview image
.github/workflows/  checks every PR, deploys main to GitHub Pages, writes sitemap.xml
```

## Pages

- `./` — home (Polish), `?lang=en` — home (English)
- `?m=galena` — a module page, `?lang=en&m=galena` — the same in English
- `?p=legal` — legal notice and privacy (appears once the operator is filled in at /admin/)

The PL/EN link in the header keeps you on the same page.

## Editing

Open `/admin/`. Everything is in **Strona → Treść strony**; switch between PL and EN at the
top of the editor. Adding, removing or reordering a module or a goal in Polish does the same
in English; only the texts are translated separately.

Saving in the admin commits to `main`, and the Pages workflow publishes it within a minute or two.

Sign-in options:

- **Zaloguj się za pomocą tokenu dostępu** — paste a GitHub token with write access to this
  repository. The owner can use the token page the dialog links to; collaborators need a classic
  token (see [PROJECT.md](PROJECT.md#with-an-access-token-works-now)).
- **Pracuj z lokalnym repozytorium** — on your own machine in Chrome or Edge: pick this folder,
  edit, then commit with git yourself.
- **Zaloguj się przez GitHub** — hidden until an OAuth client
  ([Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth)) is deployed.

## Run locally

```bash
npx serve@14.2.6 --listen 8077 .
```

The site fetches `content/*.json`, so open it through a server, not as a file.
