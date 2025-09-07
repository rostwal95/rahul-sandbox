import { create } from 'zustand'; type S={page:any|null; setPage:(p:any)=>void}; export const useEditorStore=create<S>(set=>({page:null,setPage:p=>set({page:p})}));
