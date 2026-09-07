import assert from "node:assert/strict";
import test from "node:test";

test("rejects anonymous timetable access before touching the database", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("auth-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/timetables"),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    error: "Sign in with ChatGPT to manage your timetables.",
  });
});
