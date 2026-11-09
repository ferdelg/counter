import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '../ui/drawer'
import { toast } from 'sonner'
import { STORE_KEY, useStore } from '@/lib/store'
import { flinshStorage } from '@/lib/flinshStorage'
import { uploadData } from '@/lib/utils'
import { Download } from '../icons/Download'
import { Upload } from '../icons/Upload'

export const Sync = ({
	syncOpen,
	setSyncOpen,
}: {
	syncOpen: boolean
	setSyncOpen: (value: boolean) => void
}) => {
	const editList = useStore((state) => state.editList)

	async function downloadData() {
		const data = await flinshStorage.getItem(STORE_KEY)
		const dataObj = JSON.parse(data || '{}')

		if (data && dataObj.state?.list) {
			const blob = new Blob([JSON.stringify(dataObj.state.list)], {
				type: 'application/json',
			})
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = 'count_store_px.json'
			a.click()
			URL.revokeObjectURL(url)
			toast.success('Data downloaded successfully')
			setSyncOpen(false)
		} else {
			toast.error('No data to download')
			setSyncOpen(false)
		}
	}

	const btnClass =
		'flex items-center justify-center gap-2 bg-theme-bg-subtle border-theme-grey rounded-lg p-2 px-4 grow h-20 text-theme-icon font-bold text-sm'
	return (
		<Drawer
			open={syncOpen}
			onOpenChange={(e) => {
				if (e === false) {
					setSyncOpen(false)
				}
			}}
		>
			<DrawerContent>
				<DrawerHeader className="flex items-center justify-between gap-2 px-6">
					<DrawerTitle className="font-semibold">Sync</DrawerTitle>
					<DrawerClose className="bg-theme-bg-seconday text-theme-text-on-secondary py-1 px-2 rounded-[8px] active:scale-95">
						Cancel
					</DrawerClose>
				</DrawerHeader>

				<div className="flex gap-4 px-4 mt-4 mb-8">
					<button onClick={downloadData} className={btnClass}>
						<span className="flex flex-col justify-center items-center gap-2">
							<Download width={24} />
							Download
						</span>
					</button>
					<button
						onClick={() => uploadData(editList, setSyncOpen)}
						className={btnClass}
					>
						<span className="flex flex-col justify-center items-center gap-2">
							<Upload width={24} />
							Upload
						</span>
					</button>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
