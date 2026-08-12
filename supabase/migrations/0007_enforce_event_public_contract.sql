-- Public event URLs are generated with nanoid's lowercase alphanumeric, 8-character alphabet.
alter table public.events
  add constraint events_slug_format_check
  check (slug ~ '^[0-9a-z]{8}$');

-- An online event without a destination cannot be useful to participants.
alter table public.events
  add constraint events_online_location_url_check
  check (location_type <> 'online' or location_url is not null);
