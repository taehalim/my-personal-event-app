import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/EventForm';
import DeleteEventButton from '@/components/DeleteEventButton';
export default async function EventAdminPage({params}:{params:Promise<{id:string}>}){await requireAdmin();const {id}=await params;const supabase=await createClient();const [{data:event},{data:fields}]=await Promise.all([supabase.from('events').select('*').eq('id',id).single(),supabase.from('registration_fields').select('*').eq('event_id',id).order('sort_order')]);if(!event)notFound();return <main className="container" style={{padding:'48px 0 80px'}}><div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap'}}><div><Link href="/admin" className="muted">← 행사 관리</Link><h1>{event.title}</h1></div><div style={{display:'flex',gap:10}}><Link className="button secondary" href={`/admin/events/${id}/registrations`}>참가자 관리</Link><DeleteEventButton id={id}/></div></div><p><a href={`/${event.slug}`} target="_blank" className="muted">공개 링크 보기 ↗</a></p><EventForm event={event} fields={fields??[]}/></main>}
