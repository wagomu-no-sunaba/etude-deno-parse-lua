import { assertEquals } from "https://deno.land/std@0.217.0/testing/asserts.ts";
import { parseLua } from "./parseLua.ts";

Deno.test("空のとき", () => {
  const hooksFile: string[] = [];
  const options = parseLua(hooksFile, "{{{,}}}");
  assertEquals(options, []);
});

Deno.test("関係ないコメントかコメント行のとき", () => {
  const hooksFile: string[] = [
    "-- hoge",
    "fuga = 1",
  ];
  const options = parseLua(hooksFile, "{{{,}}}");
  assertEquals(options, []);
});


