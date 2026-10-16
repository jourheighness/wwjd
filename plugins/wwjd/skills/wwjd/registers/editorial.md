# Editorial: articles, essays, blogs, reports, newsletters

Success: the reader reads to the end. Typography is the interface.

## Reading
- **Measure:** 60–75 characters (about 66 is ideal). Body 18–21px on desktop, 17–18px on phones. Leading 1.5–1.65.
- **Face:** a text face chosen for long reading, with real italics. Old-style figures in prose; lining tabular figures in tables.
- **One reading column,** centred as a column. Text inside it is start-aligned: ragged-right by default (easier for dyslexic readers); justify only with hyphenation and a correct `lang`.
- **Microtypography:**
  - Smart quotes and real dashes (em dashes are correct in prose), non-breaking spaces between values and units.
  - `hanging-punctuation` where supported.
  - `text-wrap: pretty` on paragraphs and `balance` on headings.
- **Links in prose are underlined,** with tuned thickness and offset, and a visited state.
- **Light on dark:** slightly more leading and a slightly lighter weight.

## Story furniture is content
- **Kicker, headline, dek, byline, absolute published date and "updated" date.** Relative time is wrong here.
- **The kicker** comes from the publication's own section system. It is not a decorative eyebrow.
- **Figures and tables** break out to a wider column; captions carry the credit. No text over images.
- **Footnotes:** sidenotes on wide screens, popovers on narrow ones, with links back both ways.
- **Pull quotes** only when they add something; never one that repeats the paragraph next to it.
- **Contents:** a table of contents past about 1,500 words. Headings are linkable anchors.

## Around the article
- **Article lists** show the title, dek, date and author, scannable without cards for every item.
- **Distribution:** a print stylesheet, RSS, and semantic HTML that reader mode can parse.
- **Motion:** none in the reading column. No reading progress bar by default. No sticky share rails, no parallax.
- **Ads and embeds:** reserve their space so the text never jumps.

## Tells to avoid
- Cream ground, terracotta accent and a huge italic serif: the "warm editorial" default.
- Hairlines everywhere with mono captions: broadsheet cosplay.
- Drop caps on every post.
- Pull quotes that duplicate the text next to them.
- A hero image that pushes the first sentence below the fold on a phone.
