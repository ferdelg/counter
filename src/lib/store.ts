import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { flinshStorage } from './flinshStorage'

export const STORE_KEY = 'count_store_px'

interface State {
	list: ListProps
	editList: (list: ListProps) => void
	profile: ProfileProps
	editProfile: (profile: ProfileProps) => void
}

export type ListProps = {
	name: string
	count: number
	meta: {
		creation_date: string
		last_update: string
		activity: {
			[isoDate: string]: number
		}
	}
}[]

export type ProfileProps = {
	name: string
	counterName: string
	theme: 'red' | 'blue'
}

export const useStore = create<State>()(
	persist(
		(set) => ({
			list: [],
			editList: (newList) => set(() => ({ list: newList })),
			profile: {
				name: 'Counter',
				counterName: '',
				theme: 'red',
			},
			editProfile: (newProfile) => set(() => ({ profile: newProfile })),
		}),
		{
			name: STORE_KEY,
			storage: createJSONStorage(() => flinshStorage),
			// Hydrate explicitly from main.tsx once we know whether the Flinsh
			// bridge is present, so the right backend is read.
			skipHydration: true,
		}
	)
)
