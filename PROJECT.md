# Prowe website — project notes

What this site is, why it is built this way, how editors sign in, and what is left to do.
For running it locally see [README.md](README.md).

## What it is

A one-page site plus one page per module, in Polish and English, edited in a browser at
**[/admin/](https://alpaq92.github.io/prowe-website/admin/)**. Hosted on GitHub Pages from this repository.

| | |
|---|---|
| Site | [alpaq92.github.io/prowe-website](https://alpaq92.github.io/prowe-website/) |
| Admin | [alpaq92.github.io/prowe-website/admin](https://alpaq92.github.io/prowe-website/admin/) |
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
writes JSON, and `app.js` (about 175 lines) renders it in the browser. Nothing to compile, nothing
to upgrade except two pinned scripts. marked is a copy in `vendor/marked`, served from the site
(MIT, with a BSD notice, in `vendor/marked/LICENSE`); the Sveltia script loads from a CDN with an
SRI hash, so the browser refuses it if the file changes. The hash covers only that file: some
features make Sveltia import more code from unpkg.com without a hash, e.g. the image metadata
reader when an image is selected in the media library and the code highlighter when a Markdown
field holds a code block.

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
edit.** That means the Write, Maintain or Admin role: Sveltia does not let in a collaborator with
read access only. Add editors as collaborators: repository → Settings → Collaborators.

### With an access token (works now)

1. Open the [admin page](https://alpaq92.github.io/prowe-website/admin/) and choose **Zaloguj się za pomocą tokenu dostępu**, the only sign-in option until the GitHub button is set up.
2. Create a token and paste it:
   - **The repository owner** can use the token page the dialog links to: a fine-grained token for this repository only, with **Contents: Read and write**.
   - **Collaborators** need a classic token, because GitHub lets only classic tokens write to a public repository someone else owns: [create one with the `public_repo` scope](https://github.com/settings/tokens/new?scopes=public_repo&description=Sveltia%20CMS%20prowe-website). `public_repo` should be enough for this public repository (not yet tested with Sveltia); `repo` also works, but opens every private repository of that person.
3. The token is kept in that browser's local storage. Sign out from the account menu to remove it.

### Where the token lives

Sveltia keeps the editor's GitHub token in the browser's local storage for this site's origin. Today that origin is `alpaq92.github.io`, shared with this account's other GitHub Pages sites (12 on 2026-10-04): a script on any of them can read the token while the editor is signed in in that browser. A custom domain gives the admin an origin of its own, which is why it is first on the To do list. Until then, sign out after editing.

### With the "Sign in with GitHub" button (not set up)

GitHub has no sign-in flow that works from a static page alone: exchanging the sign-in code for a token needs the OAuth app's client secret, and GitHub's token endpoint does not accept requests from a browser. Sveltia's PKCE sign-in for GitHub is unimplemented for that reason, so a small OAuth client has to hold the secret.

1. Deploy [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare Workers (free plan: 100,000 requests a day). Note the Worker URL, `https://sveltia-cms-auth.<subdomain>.workers.dev`, and the commit you deployed: the project has no releases.
2. Register a GitHub OAuth app (github.com/settings/applications/new) with the authorization callback URL `<Worker URL>/callback`, then generate a client secret.
3. In the Worker, Settings → Variables: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (encrypted) and `ALLOWED_DOMAINS` = `alpaq92.github.io`, the hostname only, in lower case (the Worker compares it case-sensitively).
4. In `admin/config.yml` under `backend`: `base_url: <Worker URL>` (no path) and `auth_scope: public_repo` (without it Sveltia asks for `repo`, which opens every private repository of the editor); remove `auth_methods: [token]`.

Set up the custom domain first (see To do), then use it in `ALLOWED_DOMAINS`.

### On your own machine

**Pracuj z lokalnym repozytorium**, in Chrome or Edge, served locally (see README). Pick the
repository folder; edits are written straight to the files, and you commit them with git.

## How a change goes live

1. An editor saves in `/admin/`.
2. Sveltia commits `content/pl.json` / `content/en.json` to `main`.
3. The Pages workflow checks the JSON and deploys. The change is live in about a minute.

Things to know when editing a public repository this way:

- Protecting `main` with required pull requests makes the CMS read-only (Sveltia 0.225 and later); it would then need Sveltia's editorial workflow.
- Every save is a commit under the editor's GitHub identity. An editor who has not turned on "Keep my email addresses private" in GitHub publishes their email address in the history.
- Add images through the media library (`images/`). An image linked from another site loads from that site and breaks the privacy page's statement that every file comes from GitHub Pages.
- `index.html` holds fixed copies of the Polish `headline` and `description` (`<title>`, meta description, `og:title`, `og:description`, `og:image:alt`), and `images/og.png` shows the headline and the module names. After changing them in the admin, update these by hand, or link previews and crawlers without JavaScript keep the old text.

## To do

- [ ] **Custom domain** — first, because the admin's token shares the `alpaq92.github.io` origin with this account's other sites (see *Where the token lives*). Set it in repository → Settings → Pages, then update `site_url` in `admin/config.yml`, the links in the README, the absolute `og:image` URL in `index.html`, `ALLOWED_DOMAINS` in the authenticator, and drop the alpaq92.github.io sentence from the privacy text (`legal.body`, both languages).
- [ ] **Sign in with GitHub** — follow the steps above. Until then the admin offers token sign-in only (`auth_methods: [token]`).
- [ ] **Legal notice and privacy** — the page is built (`?p=legal`) and stays hidden, together with its footer link, until the operator's name, address and email are filled in at /admin/ → Strona → Treść strony → Informacje prawne. Who runs the site is still to be decided; each field's hint lists what the law asks for each legal form.
- [ ] **Remove leftover Publii data** — on the machine where the site was first built. Nothing was found on Tobiasz's machine (2026-10-04).
- [x] **Check the name** — 2026-10-04: no identical trademark in the EUIPO, UPRP, WIPO (Madrid) or USPTO registers. `prowe.pl` and `prowe.com` belong to third parties and are parked for sale; `prowe.app` and `prowe.legal` were free. Similar marks and company names exist in software, so have a trademark attorney look before filing a trademark or buying a domain. The detailed report was shared outside this repository.
- [ ] **Search engines** — done: link-preview tags and image in `index.html`, `sitemap.xml` generated on deploy. Left: verify the site in Google Search Console (URL-prefix property, HTML-tag method) and submit `sitemap.xml`; in Bing Webmaster Tools, import from Search Console. A `robots.txt` under `/prowe-website/` would be ignored. Crawlers that don't run JavaScript (AI assistants, partly Bing) still see an empty page; pre-rendering to path URLs (`/en/`, `/galena/`) fixes that in about half a day to a day, best done together with the custom domain.
- [ ] **Upgrades, monthly and on every Sveltia security advisory** — checked 2026-10-04: Sveltia CMS 0.227.4 and marked 18.0.14 are the latest. Sveltia: change the version in `admin/index.html` and in the `$schema` line of `admin/config.yml`, recompute the `integrity` value (`echo "sha384-$(curl -sL <script URL> | openssl dgst -sha384 -binary | openssl base64 -A)"`) and paste the whole output into the attribute: without the `sha384-` prefix the browser ignores it and loads the file unchecked. Read the release notes for BREAKING CHANGE. marked: replace `vendor/marked/marked.umd.js` and `vendor/marked/LICENSE` with the new version's `lib/marked.umd.js` and `LICENSE`, and update the version in the README file tree.
- [x] **Review the copy** — 2026-10-04: every claim checked against the module repositories and rewritten where the code does not support it (the goals, Atrium, Sygna's information barriers, Galena's review and encryption, Counsel's purpose, Compass). Module issues that need code rather than copy changes were reported separately.
