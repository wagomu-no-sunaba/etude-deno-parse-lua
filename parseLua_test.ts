import { assertEquals } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { parseLua } from "./parseLua.ts";
import { type Plugin } from "https://deno.land/x/dpp_vim@v0.0.7/types.ts";

Deno.test("空のとき", () => {
  const hooksFile: string[] = [];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  assertEquals(plugins, []);
});

Deno.test("関係ないコメントかコメント行のとき", () => {
  const hooksFile: string[] = [
    "-- hoge",
    "fuga = 1",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  assertEquals(plugins, []);
});

Deno.test("単一のレポジトリだけ設定", () => {
  const hooksFile: string[] = [
    "-- {{{ repo: 'hoge' }}}",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  const expected: Plugin[] = [
    {
      name: "hoge",
      repo: "hoge",
    },
  ];
  assertEquals(plugins, expected);
});
