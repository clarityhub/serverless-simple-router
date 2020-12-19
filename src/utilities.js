export const DEFAULT_URL_OPTIONS = {
	segmentValueCharset: 'a-zA-Z0-9-_~ %:',
};

export const DEFAULT_NOT_FOUND_RESPONSE = {
	statusCode: '404',
	body: JSON.stringify({ error: 'Route not found' }),
	headers: {
		'Content-Type': 'application/json',
	},
};

export const normalizePath = (path) => {
	// strip any trailing slashes
	if (path.substring(path.length - 1) === '/') {
		path = path.substring(0, path.length - 1);
	}

	return path;
};

export const normalizeMethod = (method) => {
	return method.toUpperCase();
};
