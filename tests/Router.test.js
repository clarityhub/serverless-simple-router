import Router from '../src/Router';

const DATA = Symbol('data example');

const myClass = {
	getTest() {
		return DATA;
	},

	getAll() {
		return {};
	},

	get() {
		return {};
	},

	create() {
		return {};
	},

	update(event, context, cb) {
		cb('success');
	},

	delete() {
		return {};
	},
};

describe('Router', () => {
	it('adds GET route', () => {
		const router = new Router();
		expect(router.routes).toHaveLength(0);
		router.get('/test', myClass, 'getTest');
		expect(router.routes).toHaveLength(1);
		expect(router.routes[0].method).toBe('GET');
	});

	it('adds POST route', () => {
		const router = new Router();
		expect(router.routes).toHaveLength(0);
		router.post('/test', myClass, 'getTest');
		expect(router.routes).toHaveLength(1);
		expect(router.routes[0].method).toBe('POST');
	});

	it('adds PUT route', () => {
		const router = new Router();
		expect(router.routes).toHaveLength(0);
		router.put('/test', myClass, 'getTest');
		expect(router.routes).toHaveLength(1);
		expect(router.routes[0].method).toBe('PUT');
	});

	it('adds DELETE route', () => {
		const router = new Router();
		expect(router.routes).toHaveLength(0);
		router.delete('/test', myClass, 'getTest');
		expect(router.routes).toHaveLength(1);
		expect(router.routes[0].method).toBe('DELETE');
	});

	it('adds a default set of resource routes', () => {
		const router = new Router();
		expect(router.routes).toHaveLength(0);
		router.resource('/test', myClass);
		expect(router.routes).toHaveLength(5);
	});

	it('resolves an event', (done) => {
		const router = new Router();
		router.resource('/test', myClass);

		const event = {
			path: '/test/123',
			httpMethod: 'PUT',
		};
		const context = {};
		const cb = (result, error) => {
			expect(result).toBe('success');
			expect(error).toBeFalsy();

			done();
		};

		router.exec()(event, context, cb);
	});

	it('returns a 404', (done) => {
		const router = new Router();
		router.resource('/test', myClass);

		const event = {
			path: '/test/123/xyz',
			httpMethod: 'PUT',
		};
		const context = {};
		const cb = (result, error) => {
			expect(result).toBeFalsy();
			expect(error).toMatchObject({ statusCode: '404' });

			done();
		};

		router.exec()(event, context, cb);
	});

	it('returns a custom 404', (done) => {
		const router = new Router({
			notFoundResponse: {
				statusCode: '404',
				body: JSON.stringify({ error: 'This route wasn\'t found' }),
				headers: {
					'Content-Type': 'application/json',
				},
			},
		});
		router.resource('/test', myClass);

		const event = {
			path: '/test/123/xyz',
			httpMethod: 'PUT',
		};
		const context = {};
		const cb = (result, error) => {
			expect(result).toBeFalsy();
			expect(error).toMatchObject({ body: '{"error":"This route wasn\'t found"}' });

			done();
		};

		router.exec()(event, context, cb);
	});
});
