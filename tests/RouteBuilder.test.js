import RouteBuilder from '../src/RouteBuilder';

const DATA = Symbol('data example');
const USER = Symbol('user example');

function Controller() {
	return {
		test() {
			return DATA;
		},

		getBody({ data }) {
			return data;
		},

		getUser({ user }) {
			return user;
		},

		getRBAC({ context }) {
			return context.rbac;
		},
	};
}

function TaskCrudController() {
	return {
		get() {
			return {};
		},
		getAll() {
			return {};
		},
		create() {
			return {};
		},
		update() {
			return {};
		},
		delete() {
			return {};
		},
	};
}

function getUserMiddy() {
	return {
		async before({ context }) {
			context.user = USER;
		},
	};
}

function useRbac(options) {
	return {
		async before({ context }) {
			context.rbac = options.rbac;
		},
	};
}

describe('RouteBuilder', () => {
	describe('method', () => {
		it('creates a middy chain', () => {
			const route = RouteBuilder.method(Controller, 'test');

			expect(typeof route).toBe('function');
		});

		it('calls the cb', (done) => {
			const route = RouteBuilder.method(Controller, 'test');

			const event = {};
			const context = {};
			const cb = (failure, success) => {
				expect(failure).toBeFalsy();
				expect(success).toBe(DATA);
				done();
			};

			route(event, context, cb);
		});

		it('passes through the body', (done) => {
			const route = RouteBuilder.method(Controller, 'getBody');
			const BODY = Symbol('body example');

			const event = { body: BODY };
			const context = {};
			const cb = (failure, success) => {
				expect(failure).toBeFalsy();
				expect(success).toBe(BODY);
				done();
			};

			route(event, context, cb);
		});

		it('uses middleware as a function', (done) => {
			const route = RouteBuilder.method(Controller, 'getUser', [getUserMiddy]);
			const event = { };
			const context = {};
			const cb = (failure, success) => {
				expect(failure).toBeFalsy();
				expect(success).toBe(USER);
				done();
			};

			route(event, context, cb);
		});

		it('uses evaluated middleware', (done) => {
			const route = RouteBuilder.method(Controller, 'getUser', [getUserMiddy()]);
			const event = { };
			const context = {};
			const cb = (failure, success) => {
				expect(failure).toBeFalsy();
				expect(success).toBe(USER);
				done();
			};

			route(event, context, cb);
		});

		it('passes default rbac metadata', (done) => {
			const route = RouteBuilder.method(Controller, 'getRBAC', [useRbac]);
			const event = { };
			const context = {};
			const cb = (failure, success) => {
				expect(failure).toBeFalsy();
				expect(success).toStrictEqual({
					resource: undefined,
					action: 'readAny',
				});
				done();
			};

			route(event, context, cb);
		});

		it('passes through rbac metadata', (done) => {
			const route = RouteBuilder.method(Controller, 'getRBAC', [useRbac], {
				rbac: 'user',
				rbacAction: 'read',
			});
			const event = { };
			const context = {};
			const cb = (failure, success) => {
				expect(failure).toBeFalsy();
				expect(success).toStrictEqual({
					resource: 'user',
					action: 'read',
				});
				done();
			};

			route(event, context, cb);
		});
	});

	describe('crud', () => {
		const route = RouteBuilder.crud(TaskCrudController, [useRbac], {
			rbac: 'tasks',
		});

		expect(typeof route).toBe('object');
		expect(typeof route.get).toBe('function');
		expect(typeof route.getAll).toBe('function');
		expect(typeof route.create).toBe('function');
		expect(typeof route.update).toBe('function');
		expect(typeof route.delete).toBe('function');
	});
});
