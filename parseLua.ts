import { type Plugin } from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";
import { is } from "https://deno.land/x/unknownutil@v3.16.3/mod.ts";

export function parseLua(filelines: string[], marker: string): Plugin[] {
  const startMarker = marker.split(",")[0];
  const endMarker = marker.split(",")[1];
  const luaComment = "--";
  const plugins: Plugin[] = [];
  let plugin: Plugin | null = null;
  let hookName = "";
  for (const _line of filelines) {
    const line = _line.trim();
    if (line.startsWith(luaComment) && line.includes(startMarker)) {
      // single line
      if (line.includes(endMarker) && line.endsWith(endMarker)) {
        const endMarkerPos = line.lastIndexOf(endMarker);
        if (endMarkerPos < 0) continue;

        const startMarkerPos = line.lastIndexOf(startMarker);
        const match = line.slice(
          startMarkerPos + startMarker.length,
          endMarkerPos,
        ).trim().match(/^(?<hookName>[a-z_]+)\s*:\s*(?<hookValue>.+)/);

        if (!match || !match.groups) continue;
        const hook = match.groups.hookName;
        const hookValue = eval(match.groups.hookValue);
        if (!hookValue || !hook) continue;
        switch (hook) {
          case "repo":
            if (plugin) {
              if (!plugin.name) {
                plugin.name = plugin.repo ?? "";
              }
              plugins.push(plugin);
              plugin = null;
            }
            plugin = { name: hookValue, repo: hookValue };
            break;
          case "name":
            if (!plugin) continue;
            if (!is.String(hookValue)) continue;
            plugin.name = hookValue;
            break;
          case "on_ft":
            if (!plugin) continue;
            if (is.String(hookValue) || is.Array(is.String(hookValue))) {
              plugin.on_ft = hookValue;
            }
            break;
          default:
            plugin = { name: hookValue, repo: hook };
        }
      }
    }
  }
  if (plugin) {
    plugins.push(plugin);
  }
  return plugins;
}

