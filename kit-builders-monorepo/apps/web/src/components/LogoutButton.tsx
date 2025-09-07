'use client';
export default function LogoutButton(){
  return <button className="btn btn-outline" onClick={async()=>{ await fetch('/api/session/logout',{method:'POST'}); location.href='/login'; }}>Logout</button>;
}
