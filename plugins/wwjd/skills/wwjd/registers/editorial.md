# Editorial: articles, essays, blogs, reports, newsletters

Profile: `data-profile="reading"` (`.breakout`, `.flow`). Colour: lives in the frame and the figures, not the text.

Success: the reader reads to the end. Typography is the interface. Layouts: `article`, `blog-index`.

## Reading
- **Measure** 60–75 characters (~66 ideal). Leading 1.5–1.65; light on dark gets slightly more leading and a lighter weight.
- **Face:** a text face built for long reading, real italics. Its regular must read as regular at body size: dense or high-optical-size faces (Literata at small opsz) look bold; check a paragraph in the render and step to a lighter face or weight. Body is ink at 400; bold is for emphasis only. Owner, 2026-10-17: the reading font read bold and tiring. Old-style figures in prose; lining tabular figures in tables.
- **One reading column,** centred as a column; text inside start-aligned, ragged-right by default. Justify only with hyphenation and a correct `lang`.
- **Microtypography:** smart quotes, real dashes (em dashes are right in prose), non-breaking spaces between values and units, `hanging-punctuation` where supported, `text-wrap: pretty` on paragraphs and `balance` on headings.
- **Prose links** underlined with tuned thickness and offset, plus a visited state.

## Story furniture is content
- **Kicker, headline, dek, byline, absolute published date and "updated" date.** Never relative time here.
- **The kicker** comes from the publication's section system; it is not a decorative eyebrow.
- **Figures and tables** break out to a wider column; captions carry the credit. No text over images.
- **Footnotes:** sidenotes on wide screens, popovers on narrow, linked both ways.
- **Pull quotes** only when they add something, never repeating the paragraph beside them.
- **Long reads get wayfinding** (past ~1,500 words): a side index in the margin on wide screens that marks the current section, a contents disclosure on narrow ones, linkable headings. The current-section mark is the progress; no progress bar (a moving bar is decoration that pulls the eye). Owner, 2026-10-17.
- **Reading is the focus:** site chrome recedes once the story starts: the top menu is not sticky and scrolls away; the article's end leads to the next read. Nothing competes with the column.

## Around the article
- **Lists** show title, dek, date and author, scannable without a card per item.
- **Distribution:** print stylesheet, RSS, semantic HTML that reader mode parses.
- **No motion in the reading column;** no progress bars, sticky share rails or parallax.
- **Ads and embeds** reserve their space.

## Tells to avoid
- Cream ground, terracotta accent and a huge italic serif (the "warm editorial" default).
- Hairlines everywhere with mono captions (broadsheet cosplay).
- Drop caps on every post; a hero image that pushes the first sentence below the fold on a phone.
