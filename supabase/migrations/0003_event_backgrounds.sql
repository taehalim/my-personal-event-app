alter table public.events add column if not exists background_preset text not null default 'plain';

alter table public.events drop constraint if exists events_background_preset_check;
alter table public.events add constraint events_background_preset_check check (background_preset in ('plain','aurora','prism','constellation','orbit','bubbles','sparkles','rain','confetti'));
