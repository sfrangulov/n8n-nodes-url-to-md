declare module '@joplin/turndown' {
	export default class TurndownService {
		constructor(options?: Record<string, unknown>);
		use(plugin: unknown): TurndownService;
		turndown(html: string): string;
	}
}

declare module '@joplin/turndown-plugin-gfm' {
	export const gfm: unknown;
}
