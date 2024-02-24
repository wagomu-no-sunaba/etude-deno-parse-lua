import { Plugin } from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";

export function parseLua(filelines: string[], marker: string): Plugin[] {
  const startMarker = marker.split(",")[0];
  const endMarker = marker.split(",")[1];
  const luaComment = "--";
  const plugins: Plugin[] = [];
  for (const line of filelines) {
    if (
      line.startsWith(luaComment) && line.includes(startMarker) &&
      line.includes(endMarker)
    ) {
      const endMarkerPos = line.lastIndexOf(endMarker);
      if (endMarkerPos < 0) continue;

      const match = line.slice(0, endMarkerPos).match(
        new RegExp(
          `^${luaComment}\\s*${startMarker}\\s*repo\\s*:\\s*'(?<repoName>.+)'\\s*`,
        ),
      );

      if (!match || !match.groups) continue;
      const repo = match[1];

      if (!repo) continue;
      plugins.push({ name: repo, repo: repo });
    }
  }
  return plugins;
}

