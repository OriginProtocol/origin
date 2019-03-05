# Listing Types

This dir contains directories for each Origin Listing Type, and components for dispalying the UI for generating a listing of each type.

Each directory contains a master "controller" component which determines the order in which creation steps are shown, and how forward-back navigation works. It is expected that the final step (Presumably the `Review.js` step) will actually create the listing.

- `/listing-types`
	- `/AnnouncementListing`
		- `AnnouncementListing.js` : Controller
		- `Details.js` : Details step
		- `Review.js` : Review step
	- `/FractionalListing`
		- `FractionalListing.js` : Controller
		- `Details.js` : Details step
		- `Availability.js` : Availability calendar step
		- `Boost.js` : Boost step
		- `Review.js` : Review step
	- `/<Listing Type Name>`
		- `<Listing Type Name>.js` : Controller
		- `<Step 1>.js` : A step
		- `<Step n>.js` : Additional steps

NOTE: In the future there directories will be expanded to include all listing type related logic such as:

- Listing display
- Listing card display
- Offer generation
