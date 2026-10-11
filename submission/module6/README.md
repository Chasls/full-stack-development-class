# Module Six submission

Upload `travlr.zip` and these three images to Brightspace:

1. `01-card-listing-added-trip.png`: four trip cards, including Island Escape added through the Angular form.
2. `02-edit-screen.png`: the added trip loaded in the edit form.
3. `03-update-screen.png`: saved update, success message, renamed trip, and revised price.

The mobile listing and public website screenshots provide additional evidence.

Verification completed October 5, 2026:

- 16 backend integration tests passed against an isolated MongoDB database.
- 9 Angular tests passed using mock trip data and mock HTTP responses.
- Postman collection runner: 11 requests and 19 assertions passed.
- Chrome browser workflow passed: add, edit, update, refresh, deletion confirmation/cancellation, database persistence, public website rendering, and mobile layout.
- Production Angular build completed successfully.

The source is prepared on the `module6` branch in the GitHub repository.

See `travlr/README.md` inside the ZIP for install and run commands. The ZIP includes the built admin SPA and omits dependency folders. Restore the additional sample trip with `npm run seed:module6` after the original seed.
