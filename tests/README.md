# Test suites

**Owner:** Zallen

These measure the software. eval/ measures the model.

The 2am test: one golden contract end to end, deterministic against a mocked
provider, green in under a minute.

Every test that calls a real provider is a flaky test. Mock by default; run the
live suite deliberately and separately.
