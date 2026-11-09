import React from 'react'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { Star } from './components/icons/Star.tsx'
import { Cross } from './components/icons/Cross.tsx'
import { hydrationError, useStore } from './lib/store'

const ErrorIconCircle = () => {
	return (
		<div className="rounded-full bg-warning-dark w-5 h-5 flex items-center justify-center">
			<Cross width={10} fill="var(--theme-bg-light)" />
		</div>
	)
}

type HydrationState = 'loading' | 'ready' | 'error'

// persist swallows storage errors during rehydrate(); hasHydrated() stays
// false when the read failed.
async function hydrate(): Promise<HydrationState> {
	await useStore.persist.rehydrate()
	return useStore.persist.hasHydrated() ? 'ready' : 'error'
}

const Splash = ({ children }: { children: React.ReactNode }) => (
	<div className="h-[100svh] flex flex-col items-center justify-center gap-4 text-theme-text text-sm font-semibold">
		{children}
	</div>
)

export const Root = () => {
	const [state, setState] = React.useState<HydrationState>('loading')

	const load = React.useCallback(() => {
		setState('loading')
		hydrate().then(setState)
	}, [])

	React.useEffect(load, [load])

	React.useEffect(() => {
		if (state !== 'loading') window.flinsh?.ready?.()
	}, [state])

	if (state === 'loading') {
		return (
			<Splash>
				<div
					aria-label="Loading"
					className="w-8 h-8 rounded-full border-4 border-theme-bg-seconday border-t-theme-icon animate-spin"
				/>
			</Splash>
		)
	}

	if (state === 'error') {
		// Never render the app on a failed load: its first write would
		// overwrite the saved counters with an empty list.
		return (
			<Splash>
				<p>Couldn't load your counters.</p>
				<p className="px-6 text-center text-xs font-medium opacity-70 break-words max-w-full">
					{hydrationError instanceof Error
						? hydrationError.message
						: String(hydrationError ?? 'Unknown error')}
				</p>
				<button
					onClick={load}
					className="bg-theme-bg-seconday text-theme-text-on-secondary py-2 px-4 rounded-[8px] active:scale-95"
				>
					Try again
				</button>
			</Splash>
		)
	}

	return (
		<>
			<App />
			<Toaster
				toastOptions={{
					duration: 2000,
					unstyled: true,
					classNames: {
						toast:
							'rounded-full flex items-center gap-2 px-3 py-2 text-xs border border-[1px] font-semibold',
						error:
							'bg-warning-secondary-bg text-warning-dark border-warning-dark',
						success: 'bg-theme-bg-seconday text-theme-icon border-text-icon',
					},
				}}
				icons={{
					success: <Star width={20} fill="var(--theme-bg-primary)" />,
					error: <ErrorIconCircle />,
				}}
			/>
		</>
	)
}
