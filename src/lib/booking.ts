import { calUsername, type CalEventSlug } from "../data/site";

export function calUrl(eventSlug: CalEventSlug): string {
  return `https://cal.com/${calUsername}/${eventSlug}`;
}
