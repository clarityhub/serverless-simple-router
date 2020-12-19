import { normalizePath, normalizeMethod } from '../src/utilities';

describe('utilities', () => {
	describe('normalizePath', () => {
		it('normalizes paths', () => {
			expect(normalizePath('/')).toBe('');
			expect(normalizePath('/1/2/3')).toBe('/1/2/3');
			expect(normalizePath('/1/2/3/')).toBe('/1/2/3');
		});
	});

	describe('normalizeMethod', () => {
		it('normalizes method name', () => {
			expect(normalizeMethod('myMethod')).toBe('MYMETHOD');
		});
	});
});
