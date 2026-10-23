# Editorial: articles, essays, blogs, reports, newsletters

Profile: `data-profile="reading"` (`.breakout`, `.flow`), primary widths 1440 and 390 alike. Colour: lives in the frame and the figures, not the text.

Success: the reader reads to the end. Typography is the interface. Layouts: `article`, `blog-index`.

## Reading
- **Measure** 60–75 characters (~66 ideal). Leading 1.5–1.65.
- **Face:** a text face built for long reading, with real italics. Its regular must look regular at body size, since a face that reads bold tires the eye: render a paragraph, and if it looks heavy (dense strokes, a large optical size), step to a lighter face or weight. Body is ink at 400; bold only for emphasis.
- **One reading column,** centred as a column; text inside start-aligned, ragged-right. Justify only with hyphenation and a correct `lang`.
- **Microtypography:** smart quotes, real dashes (em dashes are right in prose), non-breaking spaces between values and units, `hanging-punctuation` where supported.
- **Prose links** underlined with tuned thickness and offset, plus a visited state.

## Story furniture is content
- **Kicker, headline, dek, byline, absolute published date and "updated" date.**
- **The kicker** comes from the publication's section system, never a decorative eyebrow.
- **Figures and tables** break out to a wider column; captions carry the credit. No text over images.
- **Footnotes:** sidenotes on wide screens, popovers on narrow, linked both ways.
- **Pull quotes** only with a line the paragraph beside them doesn't already show.
- **Long reads get wayfinding** (past ~1,500 words): a side index in the margin on wide screens that marks the current section, a contents disclosure on narrow ones, linkable headings. The current-section mark is the progress indicator.
- **Reading is the focus:** once the story starts, the top menu scrolls away, never sticky; the article's end leads to the next read.

## Around the article
- **Lists** show title, dek, date and author, scannable without a card per item.
- **Distribution:** print stylesheet, RSS, semantic HTML that reader mode parses.
- **No motion in the reading column:** no progress bars, sticky share rails or parallax; a moving element pulls the eye off the text.
- **Ads and embeds** reserve their space.

## Tells to avoid
- `references/bans.md` drift lanes 1 and 3.
- Drop caps on every post; a hero image that pushes the first sentence below the fold on a phone.
