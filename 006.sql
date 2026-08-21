-- Rename this file to match your actual next migration number before
-- running it.
--
-- The covers reverted to local paths (images/covers/*.jpg) because
-- 004_cover_color_and_reseed.sql seeds image_url with those paths, and no
-- such files exist in the repo — the whole point of the earlier Unsplash
-- decision was to avoid needing to commit real cover files. This restores
-- the same photos chosen back when the site still used a static BOOKS
-- array, now applied where the data actually lives: the books table.
--
-- Deliberately UPDATE by slug, not delete-and-reinsert like 004 does.
-- Re-running a delete+reinsert against a table that basket.js now
-- references via cart_items.book_id would either cascade-delete existing
-- cart rows or fail on the foreign key, depending on how that constraint
-- is defined. This migration only touches image_url and is safe to run
-- regardless of what's already in cart_items.

update books set image_url = 'https://images.unsplash.com/photo-1626657171364-4af23203469b?w=800&q=80&auto=format&fit=crop' where slug = 'intermezzo';
update books set image_url = 'https://images.unsplash.com/photo-1776766848535-7f94d9cb152c?w=800&q=80&auto=format&fit=crop' where slug = 'james';
update books set image_url = 'https://images.unsplash.com/photo-1768771463712-39c53a5b5ff8?w=800&q=80&auto=format&fit=crop' where slug = 'the-serviceberry';
update books set image_url = 'https://images.unsplash.com/photo-1603531763662-109ff15864c0?w=800&q=80&auto=format&fit=crop' where slug = 'witch';
update books set image_url = 'https://images.unsplash.com/photo-1607838660853-a2cf34eec5b9?w=800&q=80&auto=format&fit=crop' where slug = 'a-thousand-small-returns';
update books set image_url = 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80&auto=format&fit=crop' where slug = 'orbital';
update books set image_url = 'https://images.unsplash.com/photo-1602965392081-51c2cefc5b7e?w=800&q=80&auto=format&fit=crop' where slug = 'the-safekeep';
update books set image_url = 'https://images.unsplash.com/photo-1706790608211-4c03fd4f4d33?w=800&q=80&auto=format&fit=crop' where slug = 'held';

-- Sanity check after running: should return 8 rows, all starting with
-- https://images.unsplash.com/
-- select slug, image_url from books order by slug;