import { assertEquals } from "https://deno.land/std@0.217.0/testing/asserts.ts";
import { parseLua } from "./parseLua.ts";

Deno.test("parseLua", () => {
  const hooksFile: string[] = [];
  const options = parseLua(hooksFile, "{{{,}}}");
  assertEquals(options, []);
});

