import { Sidebar } from './components/Sidebar'
import { EditorFrame } from './components/EditorFrame'
import { useApp } from '@/lib/AppContext'
import { Header } from '@/components/Header'

export const Project = () => {
	const selectedPath = useApp((v) => v.selectedPath)

	return (
		<div className="flex h-screen flex-col divide-y overflow-hidden">
			<Header />

			<div className="flex min-h-0 max-w-full flex-1 flex-row divide-x">
				<div className="flex w-[300px] shrink-0 flex-col">
					<Sidebar />
				</div>

				<EditorFrame key={selectedPath} />

				{/* <div className="w-[300px] shrink-0 flex flex-col">
					<VersionControl />
				</div> */}
			</div>

			{/* <StatusBar /> */}
		</div>
	)
}
