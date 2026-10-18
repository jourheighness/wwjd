# Transact: stores, product pages, listings, cart, checkout

Profile: `data-profile="consumer"`, primary width 390. Colour: product photography carries it; the UI stays neutral.

Success: the person buys with confidence and without surprises. Layouts: `product-detail`, `listing-search`, `cart-checkout`, `pricing`.

## Product page
- **Above the fold at 390:** gallery, title, price, variant choice, add to cart. A sticky buy bar after scroll.
- **Gallery:** swipe and zoom, 5+ images, including in context and at scale.
- **Variants:** swatches with text names. Unavailable ones stay visible and look faded before the click (strike mark, "Sold out" in name or tooltip), never hidden. Choosing one swaps the buy box in place to its own path ("Notify me when it's back", restock date), shown only while it's selected.
- **Decision numbers are mandatory:** price, unit price, delivery date (a date, not "3–5 days"), shipping cost before checkout, rating with its count, true stock.
- **Specs:** vertical collapsible sections; here an accordion is right.
- **Reviews:** names as text; sort and filter by rating; show the distribution.

## Listing
- Faceted filters with applied chips, plus sort. Counts inside filter menus are fine: they change the decision.
- Cards: one image ratio, aligned with subgrid. Price and title always visible, never on hover.
- **No infinite scroll on product lists:** "Load more", position restored on Back.

## Cart and checkout
- **Cart:** editable quantities, full totals with tax and shipping; an empty cart offers recently viewed items.
- **Checkout:** guest checkout, express pay first, then `registers/flow.md` for the form. A review step before the order. The order button says it commits to pay ("Place order and pay", "Pay now"), the total beside it in the action bar's summary slot. Legally required wording is never shortened.
- **True urgency is a decision number:** "3 rooms at this rate, updated 14:14", "Order within 3 h for Friday delivery"; never "Only 1 left!". A cancellation says what ends and what stops: "Access ends Tue 6 May. No further charges."
- **The primary accent never goes on an upsell,** paid add-on or retention offer.
- **Image dimensions set** so nothing shifts.
- **EU:** the European Accessibility Act applies to e-commerce since June 2025; WCAG AA is the minimum.

## Tells to avoid
- An autoplay hero carousel; "Shop now" over stock photos.
- Quick-view modals everywhere; hover-only add to cart; a newsletter popup on first visit.
