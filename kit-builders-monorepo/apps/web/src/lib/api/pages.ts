import { api } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PageDoc } from "@/types/PageDoc";

export function usePage(id: string) {
  return useQuery({
    queryKey: ["page", id],
    queryFn: async (): Promise<PageDoc> => api.get(`pages/${id}`).json(),
  });
}

export function useSavePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: PageDoc) =>
      api
        .put(`pages/${doc.id}`, { json: doc })
        .json<{ ok: boolean; version: number }>(),
    onSuccess: (_res, doc) => {
      qc.invalidateQueries({ queryKey: ["page", doc.id] });
    },
  });
}

export function usePublishPage() {
  return useMutation({
    mutationFn: async (id: string) =>
      api.post(`pages/${id}/publish`).json<{ url: string; version: number }>(),
  });
}
