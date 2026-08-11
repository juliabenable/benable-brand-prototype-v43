import { ugcSoon } from '../data/capturedHtml.js';

/** All "Soon" pages (UGC Studio, Push Alerts, Brand Intelligence) share the
 * same empty/coming-soon layout in production. Use the captured UGC one. */
export default function SoonPage() {
  return <div dangerouslySetInnerHTML={{ __html: ugcSoon }} />;
}
