import type { StateStorage } from 'zustand/middleware'

type FlinshStore = {
	get(key: string): Promise<unknown>
	set(key: string, value: unknown): Promise<unknown>
	delete(key: string): Promise<boolean>
	list(prefix?: string): Promise<string[]>
}

type FlinshBridge = {
	input?: Record<string, unknown>
	ready?: () => void
	done?: (result: unknown) => void
	resize?: (height: number) => void
	store?: FlinshStore
}

declare global {
	interface Window {
		flinsh?: FlinshBridge
	}
}

const flinshStore = (): FlinshStore | undefined => window.flinsh?.store

// localStorage access throws in some sandboxed / opaque-origin contexts.
const local = {
	get(key: string): string | null {
		try {
			return window.localStorage.getItem(key)
		} catch {
			return null
		}
	},
	set(key: string, value: string) {
		try {
			window.localStorage.setItem(key, value)
		} catch {
			/* storage unavailable */
		}
	},
	remove(key: string) {
		try {
			window.localStorage.removeItem(key)
		} catch {
			/* storage unavailable */
		}
	},
}

// Flinsh writes are serialized so rapid taps can't land out of order.
let writeQueue: Promise<unknown> = Promise.resolve()
const enqueue = (op: () => Promise<unknown>) => {
	const next = writeQueue.then(op)
	writeQueue = next.catch((e) => {
		console.error('[flinsh] store write failed', e)
	})
	return next
}

/**
 * Zustand StateStorage backed by window.flinsh.store (user scope) when running
 * inside Flinsh, and by localStorage when standalone. Values are the JSON
 * strings Zustand's createJSONStorage produces; they are stored as-is.
 */
export const flinshStorage: StateStorage = {
	async getItem(name) {
		const store = flinshStore()
		if (!store) return local.get(name)
		const value = await store.get(name)
		if (value == null) return null
		return typeof value === 'string' ? value : JSON.stringify(value)
	},
	async setItem(name, value) {
		const store = flinshStore()
		if (!store) return local.set(name, value)
		await enqueue(() => store.set(name, value))
	},
	async removeItem(name) {
		const store = flinshStore()
		if (!store) return local.remove(name)
		await enqueue(() => store.delete(name))
	},
}
