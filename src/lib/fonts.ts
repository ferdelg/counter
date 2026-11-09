// Manrope is bundled through Vite: hashed asset URLs in the PWA build, data:
// URIs in the Flinsh single-file build (no network allowed there). The same
// sources feed both the page's @font-face rules and satori's share image, so
// the font bytes are embedded only once.
import medium from '@/assets/fonts/Manrope-Medium.ttf'
import semiBold from '@/assets/fonts/Manrope-SemiBold.ttf'
import bold from '@/assets/fonts/Manrope-Bold.ttf'
import extraBold from '@/assets/fonts/Manrope-ExtraBold.ttf'

export const MANROPE = [
	{ weight: 500, style: 'medium', src: medium },
	{ weight: 600, style: 'semi-bold', src: semiBold },
	{ weight: 700, style: 'bold', src: bold },
	{ weight: 800, style: 'extra-bold', src: extraBold },
] as const

export function installFontFaces() {
	const style = document.createElement('style')
	style.textContent = MANROPE.map(
		(f) =>
			`@font-face{font-family:'Manrope';font-style:normal;font-weight:${f.weight};font-display:swap;src:url("${f.src}") format("truetype");}`,
	).join('\n')
	document.head.appendChild(style)
}

/** Decode a data: URI without fetch() (blocked by connect-src 'none'). */
export function dataUriToBytes(uri: string): Uint8Array {
	const comma = uri.indexOf(',')
	const meta = uri.slice(0, comma)
	const payload = uri.slice(comma + 1)
	if (meta.endsWith(';base64')) {
		const bin = atob(payload)
		const bytes = new Uint8Array(bin.length)
		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
		return bytes
	}
	return new TextEncoder().encode(decodeURIComponent(payload))
}

export async function loadBytes(src: string): Promise<ArrayBuffer> {
	if (src.startsWith('data:')) {
		const bytes = dataUriToBytes(src)
		return bytes.buffer.slice(
			bytes.byteOffset,
			bytes.byteOffset + bytes.byteLength,
		) as ArrayBuffer
	}
	return fetch(src).then((res) => res.arrayBuffer())
}
