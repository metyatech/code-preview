import net from 'node:net';
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';

import { resolvePlaywrightCtPort } from './playwrightCtPort.mjs';

const heldServers = [];

afterEach(async () => {
    delete process.env.PLAYWRIGHT_CT_PORT;
    await Promise.all(
        heldServers.splice(0).map(
            (server) =>
                new Promise((resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                })
        )
    );
});

const holdPort = async (host = '127.0.0.1') =>
    await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.once('error', reject);
        server.listen({ host, port: 0 }, () => {
            heldServers.push(server);
            const address = server.address();
            if (!address || typeof address === 'string') {
                reject(new Error('Expected a numeric port for held test server'));
                return;
            }
            resolve(address.port);
        });
    });

test('resolvePlaywrightCtPort skips an occupied preferred port', async () => {
    const occupiedPort = await holdPort();

    const resolvedPort = await resolvePlaywrightCtPort({
        preferredPort: occupiedPort,
        maxAttempts: 10
    });

    assert.notEqual(resolvedPort, occupiedPort);
    assert.ok(resolvedPort > occupiedPort);
});

test('resolvePlaywrightCtPort honors PLAYWRIGHT_CT_PORT override', async () => {
    process.env.PLAYWRIGHT_CT_PORT = '41234';

    const resolvedPort = await resolvePlaywrightCtPort({
        preferredPort: 3100,
        maxAttempts: 5
    });

    assert.equal(resolvedPort, 41234);
});
