import { type Plugin } from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";

export function parseLua(filelines: string[], marker: string): Plugin[] {
  const startMarker = marker.split(",")[0];
  const endMarker = marker.split(",")[1];
  const luaComment = "--";
  const plugins: Plugin[] = [];
  let plugin: Plugin | null = null;
  for (const line of filelines) {
    if (line.startsWith(luaComment) && line.includes(startMarker)) {
      // luaコメントは先頭にあること
      if (line.lastIndexOf(luaComment) !== 0) continue;
      // single line
      if (line.includes(endMarker)) {
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
            if (typeof hookValue !== "string") continue;
            plugin.name = hookValue;
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

