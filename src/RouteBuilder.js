import middy from 'middy';

const noData = () => {
	return {};
};

const crudRoute = (
	Controller,
	methodName,
	dataCb = noData,
	additionalMiddleware = [],
	options = {}
) => {
	let chain = middy(async (event, context) => {
		let inject = {};
		if (context.ioc) {
			inject = context.ioc();
		}

		const controller = new Controller(inject);

		const data = await controller[methodName]({
			event,
			context,
			...dataCb(event, context),
			user: context.user,
			queryParams: event.queryStringParameters,
		});

		return data;
	});

	additionalMiddleware.forEach((middleware) => {
		if (typeof middleware === 'function') {
			chain = chain.use(middleware(options));
		} else {
			chain = chain.use(middleware);
		}
	});

	return chain;
};

const RouteBuilder = {
	/**
	 * Create a route handler that will call `method` on `instanceof Controller`.
	 * Optionally, add any middleware as an array of functions or resolved middy middleware.
	 * @param {Class} Controller
	 * @param {string} method
	 * @param {array<Function|Middy>} additionalMiddleware
	 * @param {object} opts
	 */
	method(Controller, method, additionalMiddleware, opts) {
		const options = { ...opts };

		const dataCb = (event) => {
			return {
				data: event.body,
				...event.pathParameter,
			};
		};

		return crudRoute(Controller, method, dataCb, additionalMiddleware, {
			rbac: {
				resource: options.rbac,
				action: options.rbacAction || 'readAny',
			},
		});
	},

	crud(Controller, additionalMiddleware, opts) {
		const options = { ...opts };

		return {
			get(...props) {
				const dataCb = (event) => {
					return {
						id: event.pathParameter.id,
					};
				};

				return crudRoute(Controller, 'get', dataCb, additionalMiddleware, {
					rbac: {
						resource: options.rbac,
						action: 'readAny',
					},
				})(...props);
			},
			getAll(...props) {
				return crudRoute(Controller, 'getAll', undefined, additionalMiddleware, {
					rbac: {
						resource: options.rbac,
						action: 'readAny',
					},
				})(...props);
			},
			create(...props) {
				const dataCb = (event) => {
					return {
						data: event.body,
					};
				};

				return crudRoute(Controller, 'create', dataCb, additionalMiddleware, {
					rbac: {
						resource: options.rbac,
						action: 'create',
					},
				})(...props);
			},
			update(...props) {
				const dataCb = (event) => {
					return {
						id: event.pathParameter.id,
						data: event.body,
					};
				};

				return crudRoute(Controller, 'update', dataCb, additionalMiddleware, {
					rbac: {
						resource: options.rbac,
						action: 'updateAny',
					},
				})(...props);
			},
			delete(...props) {
				const dataCb = (event) => {
					return {
						id: event.pathParameter.id,
					};
				};

				return crudRoute(Controller, 'delete', dataCb, additionalMiddleware, {
					rbac: {
						resource: options.rbac,
						action: 'deleteAny',
					},
				})(...props);
			},
		};
	},
};

export default RouteBuilder;
