import { configWithoutCloudSupport } from '@n8n/node-cli/eslint';

export default [
	{ ignores: ['dist', 'coverage'] },
	...configWithoutCloudSupport,
	{
		// Self-hosted community node (like n8n-nodes-docx-to-md): it ships
		// runtime deps (defuddle, linkedom, turndown) that can't be bundled.
		// Not installable on n8n Cloud — that trade-off is intentional.
		files: ['package.json'],
		rules: {
			'@n8n/community-nodes/no-runtime-dependencies': 'off',
		},
	},
];
