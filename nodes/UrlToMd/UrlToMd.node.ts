import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import Defuddle from 'defuddle';
import { parseHTML } from 'linkedom';
import TurndownService from '@joplin/turndown';
import * as turndownPluginGfm from '@joplin/turndown-plugin-gfm';

export interface ConvertOptions {
	removeImages?: boolean;
}

// Extract the main article from a full HTML page and return clean Markdown.
// Defuddle strips nav, ads, and footers (parsed via linkedom, whose selector
// engine supports Defuddle's `:has()` rules — jsdom's does not); Turndown then
// renders GitHub-flavored Markdown.
export function convert(html: string, url?: string, options: ConvertOptions = {}): string {
	const { document } = parseHTML(html);
	const result = new Defuddle(document as unknown as Document, {
		url,
		useAsync: false,
		removeImages: options.removeImages,
	}).parse();
	const turndownService = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
	});
	turndownService.use(turndownPluginGfm.gfm);
	return turndownService.turndown(result.content).trim();
}

export class UrlToMd implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'URL to Markdown',
		name: 'urlToMd',
		icon: { light: 'file:urltomd.svg', dark: 'file:urltomd.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["url"]}}',
		description: 'Fetch a URL and convert the page to clean Markdown',
		defaults: {
			name: 'URL to Markdown',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/article',
				description: 'The URL of the web page to fetch and convert to Markdown',
				required: true,
			},
			{
				displayName: 'Destination Output Field',
				name: 'destinationOutputField',
				type: 'string',
				default: 'markdown',
				placeholder: 'Destination output field for the converted Markdown text',
				description: 'The name of the destination output field for the converted Markdown text',
				required: true,
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Remove Images',
						name: 'removeImages',
						type: 'boolean',
						default: false,
						description: 'Whether to strip images from the converted Markdown',
					},
					{
						displayName: 'Request Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 30000,
						description: 'How long to wait for the page to respond before failing, in milliseconds',
					},
					{
						displayName: 'User Agent',
						name: 'userAgent',
						type: 'string',
						default: '',
						placeholder: 'Mozilla/5.0 (compatible; n8n)',
						description: 'Custom User-Agent header to send with the request. Some sites block requests without a browser-like User-Agent.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const url = this.getNodeParameter('url', i) as string;
				const destinationOutputField = this.getNodeParameter('destinationOutputField', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;

				if (!url) {
					throw new NodeOperationError(this.getNode(), 'No URL provided', { itemIndex: i });
				}

				const headers: IDataObject = {};
				if (typeof options.userAgent === 'string' && options.userAgent) {
					headers['User-Agent'] = options.userAgent;
				}

				const html = (await this.helpers.httpRequest({
					url,
					method: 'GET',
					headers,
					timeout: typeof options.timeout === 'number' ? options.timeout : 30000,
					json: false,
				})) as string;

				const markdown = convert(html, url, { removeImages: options.removeImages === true });

				returnData.push({
					json: { [destinationOutputField]: markdown },
					pairedItem: { item: i },
				});
			} catch (err) {
				const wrapped =
					err instanceof NodeOperationError
						? err
						: new NodeOperationError(this.getNode(), err as Error, { itemIndex: i });
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (err as Error).message },
						error: wrapped,
						pairedItem: { item: i },
					});
				} else {
					throw wrapped;
				}
			}
		}

		return [returnData];
	}
}
