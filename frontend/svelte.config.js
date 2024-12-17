import adapter from '@sveltejs/adapter-netlify';
import { preprocessMeltUI } from '@melt-ui/pp';
import sequence from 'svelte-sequential-preprocessor';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: sequence([
		preprocess(),
		preprocessMeltUI()
	])
};

export default config;
