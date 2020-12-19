import UrlPattern from 'url-pattern';
import {
	DEFAULT_URL_OPTIONS, DEFAULT_NOT_FOUND_RESPONSE, normalizePath, normalizeMethod,
} from './utilities';

class Router {
	constructor(options) {
		const urlOptions = (options && options.urlOptions) || DEFAULT_URL_OPTIONS;
		const notFoundResponse = (options && options.notFoundResponse) || DEFAULT_NOT_FOUND_RESPONSE;

		this.routes = [];
		this.urlOptions = urlOptions;
		this.notFoundResponse = notFoundResponse;
	}

	get(path, obj, objMethod) {
		this.routes.push({
			method: 'GET',
			path,
			pattern: new UrlPattern(path, this.urlOptions),
			obj,
			objMethod,
		});
	}

	post(path, obj, objMethod) {
		this.routes.push({
			method: 'POST',
			path,
			pattern: new UrlPattern(path, this.urlOptions),
			obj,
			objMethod,
		});
	}

	put(path, obj, objMethod) {
		this.routes.push({
			method: 'PUT',
			path,
			pattern: new UrlPattern(path, this.urlOptions),
			obj,
			objMethod,
		});
	}

	patch(path, obj, objMethod) {
		this.routes.push({
			method: 'PATCH',
			path,
			pattern: new UrlPattern(path, this.urlOptions),
			obj,
			objMethod,
		});
	}

	delete(path, obj, objMethod) {
		this.routes.push({
			method: 'DELETE',
			path,
			pattern: new UrlPattern(path, this.urlOptions),
			obj,
			objMethod,
		});
	}

	resource(path, obj) {
		this.get(path, obj, 'getAll');
		this.get(`${path}/:id`, obj, 'get');
		this.post(`${path}`, obj, 'create');
		this.put(`${path}/:id`, obj, 'update');
		this.delete(`${path}/:id`, obj, 'delete');
	}

	exec() {
		return (event, context, cb) => {
			event.path = normalizePath(event.path);
			event.httpMethod = normalizeMethod(event.httpMethod);

			// Find a matches method and pattern
			const match = this.routes.find((route) => {
				return event.httpMethod === route.method && route.pattern.match(event.path);
			});

			if (!match) {
				// No route found, return a 404
				cb(null, this.notFoundResponse);
				return;
			}

			const params = match.pattern.match(event.path);
			event.pathParameter = params;

			if (!match.objMethod) {
				// Call obj like a function
				return match.obj(event, context, cb);
			}

			if (!match.obj[match.objMethod]) {
				// No method found, return a 404
				cb(null, this.notFoundResponse);
				return;
			}

			return match.obj[match.objMethod](event, context, cb);
		};
	}
}

export default Router;
