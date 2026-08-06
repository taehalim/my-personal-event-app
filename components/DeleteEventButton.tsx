'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function DeleteEventButton({id}:{id:string}){const router=useRouter();const [loading,setLoading]=useState(false);return <button className="button danger" disabled={loading} onClick={async()=>{if(!window.confirm('이 이벤트를 삭제할까요? 관련 참가자와 이메일 기록도 삭제됩니다.'))return;setLoading(true);const res=await fetch(`/api/admin/events/${id}`,{method:'DELETE'});if(res.ok)router.push('/admin');else setLoading(false);}}>{loading?'삭제 중...':'이벤트 삭제'}</button>}
