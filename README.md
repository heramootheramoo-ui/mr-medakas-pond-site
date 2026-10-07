# Mr Medaka's Pond: website

A tiny static site for Google Play. Plain HTML, one stylesheet, a self-hosted pixel font and the
game's own art. **No JavaScript libraries, no analytics, no external requests** — the only script is
a few lines inline on the home page that rotate a quote, which talks to nobody.

- `index.html` — the landing page (early-2000s pond style: tiled grass, beveled panels, a marquee,
  pixel fish, a rotating saying).
- `privacy.html` — the **Privacy Policy**. Its URL is the one you paste into Google Play Console.
- `demo/` — a playable slice of the pond: the early browser version of the game.
- `assets/` — the game's fish sprites, pond water, icon, feature graphic, trailer and font.
- `style.css` — one stylesheet for everything.

## Before you publish
- The contact email is set in `index.html`, `privacy.html` and the footer. Change it in all three.
- When the game is live, replace `href="#"` on the "Get it on Google Play" button in `index.html`
  with your Play Store link.

## Host it free on GitHub Pages
1. Create a **public** GitHub repository, for example `mr-medakas-pond-site`.
2. Put these files in the root of the repository (`index.html`, `privacy.html`, `style.css`,
   `README.md`, plus `assets/` and `demo/`), then commit and push:

   ```
   git init
   git add .
   git commit -m "Website and privacy policy"
   git branch -M main
   git remote add origin https://github.com/<user>/mr-medakas-pond-site.git
   git push -u origin main
   ```

3. On GitHub, open the repository, then **Settings > Pages**. Under "Build and deployment", choose
   **Deploy from a branch**, set **Branch: main** and the folder **/ (root)**, and press **Save**.
4. After a minute or so the site is live at `https://<user>.github.io/<repo>/`.
5. The Privacy Policy is then at:

   `https://<user>.github.io/<repo>/privacy.html`

   This is the URL to paste into **Google Play Console** (App content > Privacy policy).

## Keep the address stable
Do not rename `privacy.html`, move it into a folder, or rename the repository after you have
submitted the URL to Google Play: the link in your store listing would break. To change the policy,
edit the text in `privacy.html` and update its "Last updated" date.
