import { PREFERENCES_STORAGE_KEY } from "@/stores/preferences-store";

/**
 * Runs before first paint to set data-theme from the saved preference (or the OS),
 * so there is no flash of the wrong theme before React hydrates.
 */
const script = `(()=>{try{
var p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)})||"{}").state||{};
var t=p.theme==="light"||p.theme==="dark"?p.theme:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
document.documentElement.dataset.theme=t;
}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
