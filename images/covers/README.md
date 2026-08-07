# Book cover images

`shop.js` looks for a cover for each book in this folder. Drop the file in and it
appears on the Shop page. Leave it out and that card falls back to the flat
colour block with the title and author set over it, the same look the homepage
previews use. Nothing renders as a broken image either way.

## Filenames

The filename must match the `coverFile` value in the `BOOKS` array in `shop.js`.

| Book | Author | File |
|---|---|---|
| Intermezzo | Sally Rooney | `intermezzo.jpg` |
| James | Percival Everett | `james.jpg` |
| The Serviceberry | Robin Wall Kimmerer | `the-serviceberry.jpg` |
| Witch | Rebecca Tamás | `witch.jpg` |
| A Thousand Small Returns | Naledi Mokoena | none — see below |
| Orbital | Samantha Harvey | `orbital.jpg` |
| The Safekeep | Yael van der Wouden | `the-safekeep.jpg` |
| Held | Anne Michaels | `held.jpg` |

"A Thousand Small Returns" is a title we invented for the Author Evening on the
homepage, so no real cover exists. Its `coverFile` is `null` and it stays a
colour block on purpose. If someone mocks up a cover for it, add
`a-thousand-small-returns.jpg` here and set `coverFile` in `shop.js` to match.

Using `.png` or `.webp` instead is fine, as long as `coverFile` in `shop.js` is
updated to the same extension.

## What the images should be

- Portrait, roughly 3:4. The cards are `aspect-ratio: 3 / 4` and the image is
  `object-fit: cover`, so anything squarer gets cropped top and bottom.
- Around 600px wide is enough. The cards render at roughly 270px, so larger
  files only cost load time.
- Keep them under about 150 KB each. Eight covers at 2 MB apiece makes the page
  crawl on a phone.

## Where to get them

Publisher and retailer sites carry cover art for exactly this purpose. Open
Library (`openlibrary.org`) hosts covers that are free to reuse and are usually
the cleanest scan available. Whichever source is used, download the file and
commit it here rather than hot-linking to someone else's server: a hot-link can
break, get rate-limited, or be swapped out without warning, and the page has no
way to recover from that.
