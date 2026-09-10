import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: persistência real — o seed sobrevive a reinicializações do processo.
// Reabre o mesmo arquivo SQLite e confirma as contagens via HTTP.
describe('persistência do seed em SQLite', () => {
  it('reabre o mesmo banco sem duplicar nem perder o seed', async () => {
    const dbPath = path.join(os.tmpdir(), `dashboard-persist-${Date.now()}.db`);

    const first = createApp({ dbPath });
    const server1 = await new Promise((resolve) => {
      const s = first.app.listen(0, () => resolve(s));
    });
    const port1 = server1.address().port;
    const seed1 = await (await fetch(`http://127.0.0.1:${port1}/api/health`)).json();
    await new Promise((resolve) => server1.close(() => resolve()));
    first.db.close();

    const second = createApp({ dbPath });
    const server2 = await new Promise((resolve) => {
      const s = second.app.listen(0, () => resolve(s));
    });
    const port2 = server2.address().port;
    const seed2 = await (await fetch(`http://127.0.0.1:${port2}/api/health`)).json();
    await new Promise((resolve) => server2.close(() => resolve()));
    second.db.close();

    assert.deepEqual(seed2.seed, seed1.seed);
    assert.ok(seed2.seed.usuarios >= 20);

    for (const suffix of ['', '-wal', '-shm', '-journal']) {
      try { fs.rmSync(`${dbPath}${suffix}`, { force: true }); } catch { /* ignore */ }
    }
  });
});
