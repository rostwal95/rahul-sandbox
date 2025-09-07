export type DashboardSummary = {
  creator: { name: string };
  checklist: {
    profile: boolean;
    page: boolean;
    email: boolean;
    publish: boolean;
  };
  stats: {
    subscribers: number;
    avg_open: number;
    deliverability: number;
    active_flags: number;
  };
  recent: { type: string; title: string; id: string; at: string }[];
};
