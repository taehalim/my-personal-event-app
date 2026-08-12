alter table public.events drop constraint if exists events_background_preset_check;

alter table public.events add constraint events_background_preset_check
  check (background_preset in (
    'galaxy', 'balatro', 'prism', 'plasma', 'tunnel', 'warp', 'threads', 'aurora',
    'midnight', 'paper'
  ));
