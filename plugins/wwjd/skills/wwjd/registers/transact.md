# Transact: stores, product pages, listings, cart, checkout

Success: the person buys with confidence and without surprises. Design mobile-first, because most commerce traffic is mobile.

## Product page
- **Above the fold at 390:** gallery, title, price, variant choice, and add to cart. A sticky buy bar appears after scroll.
- **Gallery:** swipe and zoom, with 5 or more images, including in context and at scale.
- **Variants:** swatches with text names. Unavailable variants stay visible and are visibly faded before anyone clicks (a strike mark, "Sold out" in the name or tooltip); they are never hidden. Choosing one swaps the buy box in place to its own path ("Notify me when it's back", the restock date). That path never shows while another variant is selected.
- **Decision numbers are mandatory:** price, unit price, delivery date (a date, not "3–5 days"), shipping cost before checkout, rating with its count, true stock levels.
- **Specs and details:** vertical collapsible sections. Here an accordion is the right pattern.
- **Reviews:** names as text. Allow sorting and filtering by rating; show the distribution.

## Listing
- **Filters and sort:** faceted filters with applied-filter chips, and sort. Counts inside filter menus are fine, because they change the decision.
- **Cards:** one image ratio, aligned with subgrid. Price and title are always visible, never revealed on hover.

## Cart and checkout
- **Cart:** editable quantities, full totals with tax and shipping, and an empty cart that offers recently viewed items.
- **Checkout:**
  - Guest checkout, express pay shown first, then `flow.md` rules for the form.
  - A review step before the order.
  - The order button says it commits to pay ("Place order and pay", "Pay now"), with the total beside it in the action bar's fixed summary slot, not inside the label (`registers/flow.md`, action bar). Legally required wording is never shortened.
- **Claims are checkable** (`commands/clarify.md`): "3 rooms at this rate, updated 14:14", not "Only 1 left!". A cancellation says what ends and what stops: "Access ends Tue 6 May. No further charges."
- **No dark patterns:** no fake countdowns or fake scarcity; a true delivery cutoff ("Order within 3 h for Friday delivery") and true stock are decision numbers. No pre-ticked add-ons, no confirmshaming, no costs revealed at the last step.

## Colour and imagery
- **Product photography carries the colour;** the UI stays neutral.
- **The brand's primary accent never goes on an upsell,** paid add-on or retention offer (`commands/colour.md`).
- **Image dimensions are set** so nothing shifts as images load.

## Accessibility
- The European Accessibility Act has applied to EU e-commerce since June 2025. Treat WCAG AA as the minimum.

## Tells to avoid
- An autoplay hero carousel.
- "Shop now" over stock photos.
- Quick-view modals everywhere.
- Hover-only add to cart.
- A newsletter popup on first visit.
