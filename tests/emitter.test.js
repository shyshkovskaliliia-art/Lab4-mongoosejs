/**
 * Юніт-тести для CustomEventEmitter (AppEmitter) та subscriber.
 */

const appEmitter = require('../events/appEmitter');

describe('AppEmitter — CustomEventEmitter', () => {
    it('є екземпляром EventEmitter', () => {
        // eslint-disable-next-line global-require
        const { EventEmitter } = require('events');
        expect(appEmitter).toBeInstanceOf(EventEmitter);
    });

    it('генерує і отримує подію requestCompleted', done => {
        const payload = {
            method: 'GET',
            path: '/teachers',
            status: 200,
            responseTimeMs: 3.14,
            ip: '127.0.0.1',
            userAgent: 'jest',
            timestamp: new Date().toISOString(),
        };

        appEmitter.once('requestCompleted', data => {
            expect(data.status).toBe(200);
            expect(data.path).toBe('/teachers');
            expect(data.responseTimeMs).toBe(3.14);
            done();
        });

        appEmitter.emit('requestCompleted', payload);
    });

    it('генерує і отримує подію requestStats', done => {
        const payload = {
            method: 'GET',
            path: '/teachers/1',
            pathParams: { id: '1' },
            queryParams: {},
            userAgent: 'jest',
            ip: '127.0.0.1',
            timestamp: new Date().toISOString(),
        };

        appEmitter.once('requestStats', data => {
            expect(data.pathParams).toEqual({ id: '1' });
            expect(data.queryParams).toEqual({});
            done();
        });

        appEmitter.emit('requestStats', payload);
    });

    it('підтримує кілька підписників на одну подію', () => {
        let count = 0;
        const handler = () => {
            count += 1;
        };
        appEmitter.on('testEvent', handler);
        appEmitter.on('testEvent', handler);
        appEmitter.emit('testEvent');
        appEmitter.removeAllListeners('testEvent');
        expect(count).toBe(2);
    });
});
