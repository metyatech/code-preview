import net from 'node:net';

const DEFAULT_CT_PORT = 3100;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_MAX_ATTEMPTS = 20;

const parsePort = (value, sourceLabel) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`${sourceLabel} must be an integer between 1 and 65535`);
    }

    return parsed;
};

export const isPortAvailable = async (port, host = DEFAULT_HOST) =>
    await new Promise((resolve) => {
        const server = net.createServer();
        server.unref();
        server.once('error', () => resolve(false));
        server.listen({ host, port }, () => {
            server.close(() => resolve(true));
        });
    });

export const resolvePlaywrightCtPort = async ({
    preferredPort = DEFAULT_CT_PORT,
    host = DEFAULT_HOST,
    maxAttempts = DEFAULT_MAX_ATTEMPTS
} = {}) => {
    const explicitPort = parsePort(process.env.PLAYWRIGHT_CT_PORT, 'PLAYWRIGHT_CT_PORT');
    if (explicitPort !== null) {
        return explicitPort;
    }

    const startPort = parsePort(preferredPort, 'preferredPort');
    if (startPort === null) {
        throw new Error('preferredPort is required');
    }

    for (let offset = 0; offset < maxAttempts; offset += 1) {
        const candidate = startPort + offset;
        if (candidate > 65535) {
            break;
        }
        if (await isPortAvailable(candidate, host)) {
            return candidate;
        }
    }

    throw new Error(
        `Could not find an available Playwright CT port starting at ${startPort} on ${host} within ${maxAttempts} attempts`
    );
};
