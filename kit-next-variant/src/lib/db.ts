import Dexie, { Table } from "dexie";
import {
  LandingPageType,
  EmailDocType,
  EventType,
  ThemeTokenType,
} from "./models";

export interface StoredPage extends LandingPageType {}
export interface StoredEmail extends EmailDocType {}
export interface StoredEvent extends EventType {}
export interface StoredTheme extends ThemeTokenType {}

class KitDB extends Dexie {
  pages!: Table<StoredPage, string>;
  emails!: Table<StoredEmail, string>;
  events!: Table<StoredEvent, string>;
  themes!: Table<StoredTheme, string>;
  constructor() {
    super("kit_demo");
    this.version(2)
      .stores({
        pages: "id, updatedAt, createdAt",
        emails: "id, updatedAt, createdAt",
        events: "id, ts, type",
        themes: "id, name",
      })
      .upgrade((tx) => {
        // basic migration: nothing to transform (old v1 only had events number key)
        // Could copy existing events if needed; omitted intentionally.
      });
  }
}

export const db = new KitDB();

export async function putPage(p: StoredPage) {
  await db.pages.put(p);
}
export async function putEmail(e: StoredEmail) {
  await db.emails.put(e);
}
export async function putTheme(t: StoredTheme) {
  await db.themes.put(t);
}
export async function addEvent(e: StoredEvent) {
  await db.events.put(e);
}

export async function getPages() {
  return db.pages.orderBy("updatedAt").reverse().toArray();
}
export async function getEmails() {
  return db.emails.orderBy("updatedAt").reverse().toArray();
}
export async function getThemes() {
  return db.themes.toArray();
}
export async function getRecentEvents(limit = 200) {
  return db.events.orderBy("ts").reverse().limit(limit).toArray();
}
