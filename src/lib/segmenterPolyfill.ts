import { createIntlSegmenterPolyfill } from 'intl-segmenter-polyfill'

// Only needed on browsers without Intl.Segmenter (Safari < 14.1, Firefox < 125).
// Excluded from the Flinsh single-file build: the 1.7 MB wasm can't be fetched
// under its CSP anyway.
export const loadSegmenterPolyfill = () =>
	createIntlSegmenterPolyfill(
		fetch(
			new URL(
				'intl-segmenter-polyfill/dist/break_iterator.wasm',
				import.meta.url
			)
		)
	)
