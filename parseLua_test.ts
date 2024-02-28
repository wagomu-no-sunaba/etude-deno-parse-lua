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

Deno.test("複数のレポジトリを設定", () => {
  const hooksFile: string[] = [
    "-- {{{ repo: 'hoge' }}}",
    "-- {{{ repo: 'fuga' }}}",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  const expected: Plugin[] = [
    {
      name: "hoge",
      repo: "hoge",
    },
    {
      name: "fuga",
      repo: "fuga",
    },
  ];
  assertEquals(plugins, expected);
});

Deno.test("repoとnameが別", () => {
  const hooksFile: string[] = [
    "-- {{{ repo: 'hoge' }}}",
    "-- {{{ name: 'fuga' }}}",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  const expected: Plugin[] = [
    {
      name: "fuga",
      repo: "hoge",
    },
  ];
  assertEquals(plugins, expected);
});

Deno.test("on_ftが文字列のとき", () => {
  const hooksFile: string[] = [
    "-- {{{ repo: 'hoge' }}}",
    "-- {{{ on_ft: 'fuga' }}}",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  const expected: Plugin[] = [
    {
      name: "hoge",
      repo: "hoge",
      on_ft: "fuga",
    },
  ];
  assertEquals(plugins, expected);
});

Deno.test("on_ftが配列のとき", () => {
  const hooksFile: string[] = [
    "-- {{{ repo: 'hoge' }}}",
    "-- {{{ on_ft: ['fuga', 'piyo'] }}}",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  const expected: Plugin[] = [
    {
      name: "hoge",
      repo: "hoge",
      on_ft: ["fuga", "piyo"],
    },
  ];
  assertEquals(plugins, expected);
});

Deno.test("複数行のフック", () => {
  const hooksFile: string[] = [
    "-- {{{ repo: 'hoge' }}}",
    "-- lua_source {{{",
    "foo",
    "bar",
    "baz",
    "-- }}}",
  ];
  const plugins = parseLua(hooksFile, "{{{,}}}");
  const expected: Plugin[] = [
    {
      name: "hoge",
      repo: "hoge",
      lua_source: "foo\nbar\nbaz",
    },
  ];
  assertEquals(plugins, expected);
});
