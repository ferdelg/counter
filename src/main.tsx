import ReactDOM from 'react-dom/client'
import './index.css'
import { Root } from './Root.tsx'
import { installFontFaces } from './lib/fonts'

let started = false
function start() {
	if (started) return
	started = true
	installFontFaces()
	ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
}

// The Flinsh bridge may be injected after this script parses. Wait for it,
// but fall back to standalone (localStorage) after 400 ms.
if (window.flinsh) {
	start()
} else {
	window.addEventListener('flinsh:ready', start, { once: true })
	setTimeout(start, 400)
}
