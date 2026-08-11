import { settings } from '../data/capturedHtml.js';

export default function SettingsPage() {
  return <div dangerouslySetInnerHTML={{ __html: settings }} />;
}
