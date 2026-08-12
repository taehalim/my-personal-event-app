-- An authenticated administrator can manage only the events they created and
-- their dependent registration data. Public reads remain unchanged.

drop policy if exists "public can read published events" on public.events;
create policy "public can read published events" on public.events
  for select using (status in ('published', 'cancelled'));

drop policy if exists "admins manage events" on public.events;
create policy "admins manage own events" on public.events
  for all
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "public can read fields for public events" on public.registration_fields;
create policy "public can read fields for public events" on public.registration_fields
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.status in ('published', 'cancelled')
    )
  );

drop policy if exists "admins manage fields" on public.registration_fields;
create policy "admins manage own event fields" on public.registration_fields
  for all
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.created_by = auth.uid()
    )
  );

drop policy if exists "admins manage registrations" on public.registrations;
create policy "admins manage own event registrations" on public.registrations
  for all
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.created_by = auth.uid()
    )
  );

drop policy if exists "admins manage deliveries" on public.email_deliveries;
create policy "admins manage own event deliveries" on public.email_deliveries
  for all
  using (
    exists (
      select 1
      from public.registrations r
      join public.events e on e.id = r.event_id
      where r.id = registration_id and e.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.registrations r
      join public.events e on e.id = r.event_id
      where r.id = registration_id and e.created_by = auth.uid()
    )
  );

drop policy if exists "admins manage event covers" on storage.objects;
create policy "admins manage own event covers" on storage.objects
  for all
  using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.created_by = auth.uid()
    )
  )
  with check (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.events e
      where e.id::text = (storage.foldername(name))[1]
        and e.created_by = auth.uid()
    )
  );
