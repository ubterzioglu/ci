-- The site language the guest booked in, so the confirmation email goes out in
-- that language. Nullable on purpose: rows saved before this column existed
-- have no known language and fall back to English in the mailer.
alter table public.reservation_requests
  add column if not exists locale text;

alter table public.reservation_requests
  drop constraint if exists reservation_locale_check;
alter table public.reservation_requests
  add constraint reservation_locale_check
  check (locale is null or locale in ('tr', 'en', 'de', 'ru', 'fr'));

comment on column public.reservation_requests.locale is
  'Site locale the guest submitted the form in; drives the confirmation email language.';
