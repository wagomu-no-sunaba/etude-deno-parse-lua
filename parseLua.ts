import { type Plugin } from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";
import { is } from "https://deno.land/x/unknownutil@v3.16.3/mod.ts";

export function parseLua(filelines: string[], marker: string): Plugin[] {
  const startMarker = marker.split(",")[0];
  const endMarker = marker.split(",")[1];
  const luaComment = "--";
  const plugins: Plugin[] = [];
  let plugin: Plugin | null = null;
  let luaHook: string | null = null;
  let luaHookValue: string | null = null;
  for (const _line of filelines) {
    const line = _line.trim();
    // empty line
    if (line === "") continue;
    if (
      luaHook && luaHookValue && line.startsWith(luaComment) &&
      !line.includes(startMarker) && line.endsWith(endMarker)
    ) {
      if (!plugin) continue;
      switch (luaHook) {
        case "lua_add":
        case "lua_depends_update":
        case "lua_done_update":
        case "lua_post_source":
        case "lua_post_update":
        case "lua_source":
          plugin[luaHook] = luaHookValue;
          continue;
        default:
          continue;
      }
    }
    if (luaHook) {
      if (luaHookValue) {
        luaHookValue += "\n" + line;
      } else {
        luaHookValue = line;
      }
    }
    // single line
    if (
      line.startsWith(luaComment) && line.includes(startMarker) &&
      line.endsWith(endMarker)
    ) {
      const endMarkerPos = line.lastIndexOf(endMarker);
      const startMarkerPos = line.lastIndexOf(startMarker);

      const match = line.slice(
        startMarkerPos + startMarker.length,
        endMarkerPos,
      ).trim().match(/^(?<hookName>[a-z_]+)\s*:\s*(?<hookValue>.+)/);

      if (!match || !match.groups) continue;
      const hook = match.groups.hookName;
      const hookValue = eval(match.groups.hookValue);
      const isStringArray = is.ArrayOf(is.String);
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
        case "rtp":
          if (!plugin) continue;
          if (!is.String(hookValue)) continue;
          plugin[hook] = hookValue;
          break;
        case "on_cmd":
        case "on_event":
        case "on_ft":
        case "on_func":
        case "on_if":
        case "on_lua":
        case "on_map":
        case "on_path":
        case "on_source":
          if (!plugin) continue;
          if (is.String(hookValue) || isStringArray(hookValue)) {
            plugin.on_ft = hookValue;
          }
          break;
        default:
          plugin = { name: hookValue, repo: hook };
      }
    }
    if (
      line.startsWith(luaComment) && line.endsWith(startMarker) &&
      !line.includes(endMarker)
    ) {
      const luaCommentPos = line.lastIndexOf(luaComment);
      const startMarkerPos = line.lastIndexOf(startMarker);
      const hook = line.slice(
        luaCommentPos + luaComment.length,
        startMarkerPos,
      ).trim();
      switch (hook) {
        case "lua_add":
        case "lua_depends_update":
        case "lua_done_update":
        case "lua_post_source":
        case "lua_post_update":
        case "lua_source":
          luaHook = hook;
          break;
        default:
          break;
      }
    }
  }
  if (plugin) {
    plugins.push(plugin);
  }
  return plugins;
}
