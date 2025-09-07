export type EmailTemplate = { id: string; name: string; subject: string; html: string };
export const templates: EmailTemplate[] = [
  { id: 'welcome', name: 'Welcome', subject: 'Welcome to the list!', html: '<h1>Welcome!</h1><p>Glad you are here.</p>' },
  { id: 'announcement', name: 'Announcement', subject: 'Big News', html: '<h1>We have news</h1><p>Details inside.</p>' }
];
