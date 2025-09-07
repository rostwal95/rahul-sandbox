import useSWR from 'swr';
export function usePlan(){
  const { data } = useSWR('/api/app/org', (u)=> fetch(u).then(r=>r.json()));
  return data?.plan || 'Starter';
}
