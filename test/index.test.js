import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

// Load env before importing app
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";
process.env.CSRF_SECRET = "test-csrf-secret";

const { default: app } = await import("../app.js");

describe("GET /", () => {
  it("responds 200", async () => {
    const res = await request(app).get("/");
    assert.equal(res.status, 200);
  });
});
