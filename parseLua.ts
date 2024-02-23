import {
  Plugin,
} from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";

export function parseLua(filelines: string[], marker: string): Plugin[] {
  const startMarker = marker.split(",")[0];
  const endMarker = marker.split(",")[1];
  for (const line of filelines) {
    if (line.includes(marker)) {
      const pattern = new RegExp(`^\\s*--\\s*${startMarker}\\s*repo\\s*:\\s*'(.+)\\s*'${endMarker}\\s*$`);
    }
  }

  return [];
}

