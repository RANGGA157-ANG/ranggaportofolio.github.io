# TODO: Secure Authentication Implementation

## Tasks
- [x] Update firebase-config.js: Add signInWithEmailAndPassword function
- [x] Update upload-logic.js: Remove hardcoded credentials, implement Firebase email/password auth
- [x] Update upload.html: Change username input to email input
- [ ] Enable email/password authentication in Firebase Console (manual step)
- [ ] Test login functionality
- [x] Update Firestore rules to restrict access to authenticated users

## Notes
- Email: konohaboruto37@gmail.com
- Password: 06-10-08
- Use Firebase Auth for secure login
- Rules updated to match 'uploads' collection instead of 'portfolio_uploads'

## New Tasks: Integrate Firebase into index.html Portfolio Grid
- [ ] Update index.html: Import Firebase functions (getUploads from firebase-uploads.js)
- [ ] Modify loadUploads function in index.html to use Firebase instead of localStorage
- [ ] Update portfolio grid to display top 10 uploads from all apps, sorted by totalPercent descending
- [ ] Ensure modal opens with full details when clicking a work
- [ ] Update "Karya Tradisional & Digital" section to load top 10 Digital/Traditional Art from Firebase
- [ ] Update "Gallery Foto" section to load top 10 Photography from Firebase
- [ ] Test that uploads appear in targeted app pages, all-gallery, and index.html sections
- [ ] Verify modal functionality and responsive design
