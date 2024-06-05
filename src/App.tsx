import { Sidebar } from './components/Sidebar'
import { EditorFrame } from './components/EditorFrame'
import { useApp } from '@/lib/AppContext'
import { Header } from '@/components/Header'

export const App = () => {
	const selectedPath = useApp((v) => v.selectedPath)

	return (
		<div className="flex h-screen flex-col divide-y divide-white/10 overflow-hidden">
			<Header />

			<div className="flex min-h-0 max-w-full flex-1 flex-row divide-x divide-white/10">
				<Sidebar />

				<EditorFrame key={selectedPath} />
			</div>
		</div>
	)
}
