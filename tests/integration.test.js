const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:8080';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${name}`);
      console.log(`     ${err.message}`);
      failed++;
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  console.log('\n🔍 Running integration tests against staging...\n');

  console.log('📡 Direct app tests (port 3000):');

  await test('GET / returns 200', async () => {
    const res = await get(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET / returns version field', async () => {
    const res = await get(`${BASE_URL}/`);
    assert(res.body.version === '1.0.0', `Missing version field`);
  });

  await test('GET /health returns ok', async () => {
    const res = await get(`${BASE_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.status === 'ok', `Expected status ok`);
  });

  await test('GET /api/greet/Ravi returns greeting', async () => {
    const res = await get(`${BASE_URL}/api/greet/Ravi`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.message === 'Hello, Ravi!', `Wrong message: ${res.body.message}`);
  });

  console.log('\n🔀 Nginx proxy tests (port 8080):');

  await test('Nginx proxies / correctly', async () => {
    const res = await get(`${NGINX_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('Nginx proxies /health correctly', async () => {
    const res = await get(`${NGINX_URL}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.status === 'ok', `Expected status ok`);
  });

  await test('Nginx proxies /api/greet/:name correctly', async () => {
    const res = await get(`${NGINX_URL}/api/greet/World`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
