-- Winter closure: reservation requests for 1 Nov 2026 – 19 Apr 2027 (inclusive)
-- are refused and stored as declined; the restaurant is open again on 20 Apr. The admin panel (Rezervasyonlar → Sezon
-- kapanışı) edits or removes this row; no schema change is needed because it
-- lives in the existing key/value site_settings table.
--
-- do nothing on conflict: re-running this must never overwrite dates the
-- restaurant has since changed in the panel.
insert into public.site_settings (key, value, is_public)
values (
  'reservation_season_closure',
  '{"start": "2026-11-01", "end": "2027-04-19"}'::jsonb,
  true
)
on conflict (key) do nothing;
