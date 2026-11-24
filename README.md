# Nikah Invitation Website (Angular + Firebase)

A responsive bilingual (English/Malayalam) wedding invitation inspired by the supplied reference. This is an original starter implementation, not the original site's private source code.

## Included
- Islamic invitation hero and Bismillah section
- Malayalam / English language switch
- Couple, parents and family details
- Welcome letter reveal
- Live wedding countdown
- Event schedule
- Google Calendar link and map directions
- RSVP, Dua and feedback forms backed by Firebase Firestore
- WhatsApp sharing
- Optional background music
- Responsive mobile and desktop styling

## 1. Requirements
- Node.js 18.13+ (Node 20 LTS recommended)
- npm
- Firebase project

## 2. Install and run
```bash
npm install
npm start
```
Open `http://localhost:4200`.

## 3. Personalise the wedding
Edit `src/app/wedding.config.ts`. Update:
- Couple and parents' names
- Houses / family names
- Wedding date and timings
- Venue, address and Google Maps URL
- Welcome message and event schedule
- WhatsApp number

The date must use `YYYY-MM-DD`. Update `startDateTime` to the event's local start time.

## 4. Connect Firebase
1. Create a project at https://console.firebase.google.com/
2. Add a Web App in Project settings.
3. Copy its Firebase configuration.
4. Replace the `YOUR_...` values in `src/app/firebase.service.ts`.
5. Create a Cloud Firestore database.
6. Publish the rules from `firestore.rules` in Firebase Console > Firestore Database > Rules.

The app writes form entries to:
- `rsvps`
- `duas`
- `feedback`

Do not put service-account credentials in frontend code. Firebase web config is intended for client apps; protect the database with Firestore Rules and App Check.

**Production note:** The sample rules permit anonymous form creation only in the three named collections. Public forms can still be abused. For production, enable Firebase App Check, add rate limiting / validation through a Cloud Function, and consider CAPTCHA or another abuse-prevention measure. Review privacy and consent requirements before collecting phone numbers.

## 5. Add music and photos
- Put an appropriately licensed audio file at `src/assets/wedding-music.mp3`.
- Add couple photos to `src/assets/` and update the family profile markup / CSS to use them. The starter uses decorative profile placeholders so it runs without image assets.

Autoplay is not forced. Browsers generally require a visitor interaction before audio can play.

## 6. Build and deploy
```bash
npm run build
```
Deploy the generated `dist/nikah-invitation/browser` directory to Netlify or Firebase Hosting. For Netlify, configure a single-page-app rewrite so routes fall back to `/index.html` if you add Angular routes later.

## Project structure
```text
src/
  app/
    app.component.ts
    app.component.html
    firebase.service.ts
    wedding.config.ts
  assets/
  index.html
  main.ts
  styles.css
firestore.rules
```

## Notes
- Malayalam text is Unicode and uses Noto Sans Malayalam.
- The countdown uses the browser's local timezone. Confirm the event timezone and local date/time before publishing.
- Google Calendar date generation is based on the configured local date/time; verify the generated calendar entry before sending the invitation.
