# Prowe website — project notes

What this site is, why it is built this way, how editors sign in, and what is left to do.
For running it locally see [README.md](README.md).

## What it is

A one-page site plus one page per module, in Polish and English, edited in a browser at
`/admin/`. Hosted on GitHub Pages from this repository.

| | |
|---|---|
| Site | https://alpaq92.github.io/prowe-website/ |
| Admin | https://alpaq92.github.io/prowe-website/admin/ |
| Content | `content/pl.json`, `content/en.json` |
| Publishing | `.github/workflows/pages.yml`, on every push to `main` |

## Why this stack

The requirements were:

1. **A web admin page.** Editing in a browser, not a desktop app.
2. **Polish and English in one site**, with a language switch that keeps you on the same page.
3. **Pure JavaScript**, nothing else to install or run.
4. **Permissive licences only** (MIT, Apache-2.0, BSD). No GPL, AGPL, SSPL or source-available.
5. **Simple hosting.** Static files; no server or database to keep running.

**Sveltia CMS** meets all five. It is a single JavaScript file (MIT) that adds `/admin/` to a static
site. It has no server and no database: it saves edits by committing them to this Git repository.
Polish and English are built in, edited side by side.

**No framework and no build step.** Sveltia's own guide for sites without a framework: the CMS
writes JSON, and `app.js` (about 130 lines) renders it in the browser. Nothing to compile, nothing
to upgrade except two pinned scripts.

**GitHub Pages** because the repository is already on GitHub: free for a public repository, and
the workflow redeploys whenever the CMS commits.

### Alternatives considered

| | Why not |
|---|---|
| Publii | GPL-3.0; desktop app, no web admin; one language per site |
| Decap CMS | Works the same way and is MIT, but older, partly TypeScript, slower releases |
| Keystatic | No multilingual content; needs a Node server for remote editing |
| TinaCMS | Needs the TinaCloud service, or a self-hosted Node server and MongoDB |
| Payload, Strapi | Need a running server and a database |
| Directus | Not permissively licensed (BSL) |

## Signing in to the admin

Sveltia has no user accounts of its own. **Whoever has write access to this GitHub repository can
edit.** Add editors as collaborators: repository → Settings → Collaborators.

### With an access token (works now)

1. Open `/admin/` and choose **Zaloguj się za pomocą tokenu dostępu**.
2. The dialog links to GitHub's token page with the right permissions pre-selected. Create the
   token and paste it.
   - Fine-grained token: this repository only, **Contents: Read and write**.
   - Classic token: the `repo` scope.
3. The token is kept in that browser's local storage. Sign out from the account menu to remove it.

### With the "Sign in with GitHub" button (not set up)

Needs an OAuth app on GitHub and a small OAuth client, because a static site cannot hold the
OAuth secret:

1. Deploy [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare
   Workers (free tier).
2. Register a GitHub OAuth app whose callback URL points at the authenticator.
3. Add `base_url: <authenticator URL>` under `backend` in `admin/config.yml`.

### On your own machine

**Pracuj z lokalnym repozytorium**, in Chrome or Edge, served locally (see README). Pick the
repository folder; edits are written straight to the files, and you commit them with git.

## How a change goes live

1. An editor saves in `/admin/`.
2. Sveltia commits `content/pl.json` / `content/en.json` to `main`.
3. The Pages workflow checks the JSON and deploys. The change is live in about a minute.

## To do

- [ ] **Sign in with GitHub** — deploy the authenticator (above), so editors need no tokens.
- [ ] **Custom domain** — set it in repository → Settings → Pages, then update `site_url` in
      `admin/config.yml` and the links in the README.
- [ ] **Imprint and privacy page** — a public company site in the EU needs contact details and a
      privacy note. The site sets no cookies; it only stores the theme choice in local storage.
- [ ] **Check the name** — `prowe.pl` / `prowe.com` availability and the trademark were never
      verified.
- [ ] **Search engines** — pages are rendered by JavaScript. Google indexes them; crawlers that
      don't run JavaScript see an empty page. Pre-rendering would fix that if it matters.
- [ ] **Upgrades** — Sveltia CMS is pinned to 0.227.4 in `admin/index.html` and `config.yml`
      (pre-1.0, frequent releases); marked to 18.0.14 in `index.html`. Bump them deliberately.
- [ ] **Review the copy** — especially module status (`live` / `soon`) and the "One platform"
      goal, which describes where the platform is heading.
