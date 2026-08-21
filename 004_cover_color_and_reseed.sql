alter table books add column cover_color text not null default '#2f4f3b';

delete from books; -- clears the 4-book placeholder seed from 003

insert into books (slug, title, author, price_cents, image_url, cover_color, stock, is_new) values
  ('intermezzo', 'Intermezzo', 'Sally Rooney', 34900, 'images/covers/intermezzo.jpg', '#2f4f3b', 12, true),
  ('james', 'James', 'Percival Everett', 32900, 'images/covers/james.jpg', '#1c3350', 8, true),
  ('the-serviceberry', 'The Serviceberry', 'Robin Wall Kimmerer', 27500, 'images/covers/the-serviceberry.jpg', '#4a6b33', 0, true),
  ('witch', 'Witch', 'Rebecca Tamás', 24000, 'images/covers/witch.jpg', '#3d1f5c', 10, true),
  ('a-thousand-small-returns', 'A Thousand Small Returns', 'Naledi Mokoena', 31000, 'images/covers/a-thousand-small-returns.jpg', '#7a3b22', 15, false),
  ('orbital', 'Orbital', 'Samantha Harvey', 29900, 'images/covers/orbital.jpg', '#14343a', 0, false),
  ('the-safekeep', 'The Safekeep', 'Yael van der Wouden', 33500, 'images/covers/the-safekeep.jpg', '#5c2338', 6, false),
  ('held', 'Held', 'Anne Michaels', 28900, 'images/covers/held.jpg', '#2f3b2a', 9, false);
