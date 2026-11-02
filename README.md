# 🎓 Graduation Slideshow

A photo slideshow for my graduation — family, cousins and friends.
Pure HTML / CSS / JavaScript.

## 1. Add your photos (automatic)
Your photo folder has three subfolders: `COUSIN`, `FAMILY`, `FRIENDS`.

```bash
cd graduation            # this project folder
npm i sharp              # optional: resizes photos so the site loads fast
node build-photos.js "D:\UTEM GRADUATE\GRADUATION PHOTO"
```

This copies the pictures into `photos/family`, `photos/cousins`, `photos/friends`
(clean lowercase names) and writes `photos-list.js`.

- iPhone **HEIC** files are skipped (browsers can't show them) — export as JPG first.
- Optional captions: create `captions.json` like `{ "family-001.jpg": "With Mom & Dad" }`, then run the script again.

## 2. Edit your details
Open `photos.js` and change the name, date and message.

## 3. Preview
Open `index.html` in your browser (or use VS Code Live Server).

## 4. Publish on GitHub Pages (free)
```bash
git init
git add .
git commit -m "Graduation slideshow"
git branch -M main
git remote add origin https://github.com/<your-username>/graduation.git
git push -u origin main
```
Then on GitHub: **Settings → Pages → Deploy from a branch → `main` / root → Save**.
Your site: `https://<your-username>.github.io/graduation/`

## Shortcuts
← / → change photo · Space play/pause · F fullscreen · swipe on mobile

> A public repo means anyone with the link can see the photos.
