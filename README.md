# Mr Medaka's Pond: website

A tiny static site: a landing page (`index.html`) and the Privacy Policy (`privacy.html`) for
Google Play. Plain HTML and CSS, no JavaScript, no fonts or files from anywhere else, so the site
itself collects nothing.

## Before you publish

- Replace `[your contact email]` in both `index.html` and `privacy.html` with your real address.
- When the game is live, replace `href="#"` on the "Get it on Google Play" button in `index.html`
  with your Play Store link.

## Host it free on GitHub Pages

1. Create a **public** GitHub repository, for example `mr-medakas-pond-site`.
2. Add these four files to the root of the repository (`index.html`, `privacy.html`, `style.css`,
   `README.md`), then commit and push:

   ```
   git init
   git add index.html privacy.html style.css README.md
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
