import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { UrlToMd, convert } from '../nodes/UrlToMd/UrlToMd.node';

const ARTICLE = `<!DOCTYPE html><html><head><title>Test Title</title></head>
<body><header>nav junk</header><article><h1>Heading</h1>
<p>${'Lorem ipsum dolor sit amet consectetur adipiscing elit. '.repeat(40)}</p>
<p><img src="https://example.com/pic.png" alt="pic"></p>
<ul><li>one</li><li>two</li></ul></article><footer>footer junk</footer></body></html>`;

interface CtxParams {
	[name: string]: unknown;
}

function makeContext(
	perItemParams: CtxParams[],
	opts: { continueOnFail?: boolean; httpRequest?: jest.Mock } = {},
): { ctx: IExecuteFunctions; httpRequest: jest.Mock } {
	const httpRequest = opts.httpRequest ?? jest.fn(async () => ARTICLE);
	const ctx = {
		getInputData: () => perItemParams.map(() => ({ json: {} })),
		getNodeParameter: (name: string, i: number, fallback?: unknown) => {
			const v = perItemParams[i]?.[name];
			return v === undefined ? fallback : v;
		},
		getNode: () => ({ name: 'URL to Markdown' }),
		continueOnFail: () => opts.continueOnFail ?? false,
		helpers: { httpRequest },
	} as unknown as IExecuteFunctions;
	return { ctx, httpRequest };
}

function run(ctx: IExecuteFunctions) {
	return new UrlToMd().execute.call(ctx);
}

describe('convert', () => {
	it('extracts the main article as Markdown (with url)', () => {
		const md = convert(ARTICLE, 'https://example.com');
		expect(md).toContain('Heading');
		expect(md).not.toContain('footer junk');
	});

	it('works without a url and with default options', () => {
		expect(convert(ARTICLE)).toContain('Heading');
	});

	it('strips images when removeImages is set', () => {
		const md = convert(ARTICLE, 'https://example.com', { removeImages: true });
		expect(md).not.toContain('pic.png');
	});
});

describe('UrlToMd.execute', () => {
	it('fetches a URL and returns Markdown with all options set', async () => {
		const { ctx, httpRequest } = makeContext([
			{
				url: 'https://example.com',
				destinationOutputField: 'markdown',
				options: { userAgent: 'test-agent', timeout: 5000, removeImages: true },
			},
		]);
		const out = await run(ctx);
		expect(out[0][0].json.markdown).toContain('Heading');
		expect(httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: 'https://example.com',
				method: 'GET',
				timeout: 5000,
				headers: { 'User-Agent': 'test-agent' },
			}),
		);
	});

	it('uses defaults when options are empty', async () => {
		const { ctx, httpRequest } = makeContext([
			{ url: 'https://example.com', destinationOutputField: 'md', options: {} },
		]);
		const out = await run(ctx);
		expect(out[0][0].json.md).toContain('Heading');
		expect(httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({ timeout: 30000, headers: {} }),
		);
	});

	it('throws NodeOperationError when URL is missing', async () => {
		const { ctx } = makeContext([
			{ url: '', destinationOutputField: 'markdown', options: {} },
		]);
		await expect(run(ctx)).rejects.toBeInstanceOf(NodeOperationError);
	});

	it('continueOnFail captures a missing-URL (NodeOperationError) error', async () => {
		const { ctx } = makeContext(
			[{ url: '', destinationOutputField: 'markdown', options: {} }],
			{ continueOnFail: true },
		);
		const out = await run(ctx);
		expect(out[0][0].json.error).toBe('No URL provided');
	});

	it('continueOnFail wraps a non-NodeOperationError (fetch failure)', async () => {
		const httpRequest = jest.fn(async () => {
			throw new Error('network down');
		});
		const { ctx } = makeContext(
			[{ url: 'https://example.com', destinationOutputField: 'markdown', options: {} }],
			{ continueOnFail: true, httpRequest },
		);
		const out = await run(ctx);
		expect(out[0][0].json.error).toBe('network down');
	});

	it('rethrows a fetch failure when continueOnFail is off', async () => {
		const httpRequest = jest.fn(async () => {
			throw new Error('boom');
		});
		const { ctx } = makeContext(
			[{ url: 'https://example.com', destinationOutputField: 'markdown', options: {} }],
			{ httpRequest },
		);
		await expect(run(ctx)).rejects.toBeInstanceOf(NodeOperationError);
	});
});
