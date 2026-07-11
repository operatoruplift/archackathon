-- Crystal Z seed data.
-- Game limits mirror src/lib/constants.ts — tests/registry-sql-parity.test.ts
-- keeps them in lock-step.

insert into public.games (slug, category, max_score, min_duration_ms, max_per_minute, is_new, sort) values
  ('speed-clicker',      'reaction',  150, 14000, 4, false, 1),
  ('color-match',        'attention', 300, 28000, 3, false, 2),
  ('reaction-time',      'reaction',  400, 8000,  4, false, 3),
  ('memory-cards-easy',  'memory',    240, 10000, 3, false, 4),
  ('memory-cards-hard',  'memory',    320, 20000, 3, false, 5),
  ('number-guesser',     'logic',     210, 5000,  4, false, 6),
  ('pattern-match',      'memory',    300, 15000, 3, false, 7),
  ('sliding-puzzle',     'logic',     300, 20000, 2, false, 8),
  ('trail-connect',      'attention', 300, 10000, 3, false, 9),
  ('whack-a-mole',       'reaction',  400, 28000, 3, false, 10),
  ('math-blitz',         'math',      400, 55000, 2, false, 11),
  ('emoji-odd-one-out',  'attention', 360, 40000, 2, false, 12),
  ('color-sequence',     'memory',    300, 12000, 3, true,  13);

insert into public.reward_tiers (tier, threshold, name) values
  (1,  15,   'First Facet'),
  (2,  60,   'Crystal Collector'),
  (3,  150,  'Gem Guardian'),
  (4,  400,  'Master of Minds'),
  (99, null, 'Monthly Champion');
