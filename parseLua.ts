import { type Plugin } from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";
import { is } from "https://deno.land/x/unknownutil@v3.16.3/mod.ts";
import { basename } from "https://deno.land/std@0.206.0/path/mod.ts";

export function parseLua(filelines: string[], marker: string): {
  plugins?: Plugin[];
  ftplugins?: Record<string, string>;
} {
  const startMarker = marker.split(",")[0];
  const endMarker = marker.split(",")[1];
  const luaComment = "--";

  const plugins: Plugin[] = [];
  let plugin: Plugin | null = null;
  let luaHook: string | null = null;
  let luaHookValue: string | null = null;
  let ftPlugin: Record<string, string> | null = null;
  const stringArray = is.ArrayOf(is.String);

  for (const _line of filelines) {
    const line = _line.trim();
    // empty line
    if (line === "") continue;

    // single line hook
    // e.g.
    // -- {{{ repo: "foo/bar" }}}
    if (
      line.startsWith(luaComment) && line.includes(startMarker) &&
      line.endsWith(endMarker)
    ) {
      const startMarkerPos = line.lastIndexOf(startMarker);
      const endMarkerPos = line.lastIndexOf(endMarker);
      const hook = line.slice(
        startMarkerPos + startMarker.length,
        endMarkerPos,
      ).trim().match(/^(?<hookName>[a-z_]+)\s*:\s*(?<hookValue>.+)/);

      if (!hook || !hook.groups) continue;
      const hookName = hook.groups.hookName;
      const hookValue = eval(hook.groups.hookValue);
      if (!(is.String(hookValue) || stringArray(hookValue))) continue;

      if (hookName === "repo") {
        if (plugin) {
          // if (ftPlugin) plugin.ftplugin = ftPlugin;

          plugins.push(plugin);
          plugin = null;
          luaHook = null;
          luaHookValue = null;
          // ftPlugin = null;
        }

        if (!is.String(hookValue)) continue;

        plugin = {
          repo: hookValue,
          name: basename(hookValue ?? ""),
        };
        continue;
      }
      if (hookName === "name" || hookName === "rtp") {
        if (!plugin) continue;
        if (!is.String(hookValue)) continue;

        plugin[hookName] = hookValue;
        continue;
      }

      if (!plugin) continue;

      if (
        hookName === "on_cmd" ||
        hookName === "on_event" ||
        hookName === "on_ft" ||
        hookName === "on_func" ||
        hookName === "on_if" ||
        hookName === "on_lua" ||
        hookName === "on_map" ||
        hookName === "on_path" ||
        hookName === "on_source"
      ) {
        if (!(stringArray(hookValue) || is.String(hookValue))) continue;
        plugin[hookName] = hookValue;
        continue;
      }
      continue;
    }

    // multiline hook
    // e.g.
    // -- lua_source {{{
    // ...
    // ...
    // -- }}}

    // start multiline hook
    if (
      line.startsWith(luaComment) && line.endsWith(startMarker) &&
      !line.includes(endMarker)
    ) {
      const startMarkerPos = line.lastIndexOf(startMarker);
      luaHook = line.slice(luaComment.length, startMarkerPos).trim();
      continue;
    }

    // end multiline hook
    if (
      line.startsWith(luaComment) && !line.includes(startMarker) &&
      line.endsWith(endMarker)
    ) {
      if (!plugin) continue;
      if (!(is.String(luaHook) && is.String(luaHookValue))) continue;
      if (!luaHook && !luaHookValue) continue;

      if (
        luaHook === "lua_add" ||
        luaHook === "lua_depends_update" ||
        luaHook === "lua_done_update" ||
        luaHook === "lua_post_source" ||
        luaHook === "lua_post_update" ||
        luaHook === "lua_source"
      ) {
        plugin[luaHook] = luaHookValue;
      } else {
        if (!ftPlugin) ftPlugin = {};
        ftPlugin = {
          ...ftPlugin,
          luaHook: luaHookValue,
        };
      }
      continue;
    }
    if (luaHook) {
      if (!luaHookValue) {
        luaHookValue = line;
      } else {
        luaHookValue += "\n" + line;
      }
      continue;
    }
  }
  if (plugin) {
    plugins.push(plugin);
  }
  return {
    plugins: plugins,
    ftplugins: ftPlugin ?? {},
  };
}

