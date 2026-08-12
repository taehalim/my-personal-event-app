-- Replace the original, hand-made preset catalog with the free React Bits
-- component catalog. Existing events move to their nearest visual successor.
alter table public.events drop constraint if exists events_background_preset_check;

update public.events
set background_preset = case background_preset
  when 'constellation' then 'warp'
  when 'orbit' then 'threads'
  when 'bubbles' then 'aurora'
  when 'sparkles' then 'tunnel'
  when 'rain' then 'plasma'
  when 'confetti' then 'balatro'
  when 'plain' then 'galaxy'
  else background_preset
end;

alter table public.events alter column background_preset set default 'galaxy';
alter table public.events add constraint events_background_preset_check
  check (background_preset in ('galaxy', 'balatro', 'prism', 'plasma', 'tunnel', 'warp', 'threads', 'aurora'));
