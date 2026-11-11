import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertSafeUpstreamUrl,
  isAllowedRedirectHost,
  rewriteLocationToProxy,
} from "../src/url-allowlist";
import { hashToken, generateToken } from "../src/crypto";

describe("session-service url allowlist", () => {
  it("blocks private targets", () => {
    assert.throws(() => assertSafeUpstreamUrl("https://10.0.0.5"));
    assert.throws(() => assertSafeUpstreamUrl("https://169.254.169.254/latest"));
  });

  it("rewrites same-host redirects into proxy paths", () => {
    const out = rewriteLocationToProxy(
      "https://www.example.com/dashboard?x=1",
      "https://www.example.com",
      "/proxy/example"
    );
    assert.equal(out, "/proxy/example/dashboard?x=1");
  });

  it("validates redirect hosts against allowlist", () => {
    assert.equal(
      isAllowedRedirectHost(
        "https://www.example.com/a",
        "https://www.example.com",
        ["example.com", "www.example.com"]
      ),
      true
    );
    assert.equal(
      isAllowedRedirectHost(
        "https://evil.test/phish",
        "https://www.example.com",
        ["example.com"]
      ),
      false
    );
  });
});

describe("token hash", () => {
  it("is deterministic", () => {
    const t = generateToken();
    assert.equal(hashToken(t).length, 64);
    assert.equal(hashToken(t), hashToken(t));
  });
});
