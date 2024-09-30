import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Environment } from '@/pages/Environment'
import { Header } from '@/components/Header'
import { useApp } from '@/lib/AppContext'
import { Welcome } from '@/pages/Welcome'
import { Details } from '@/pages/Details'
import { Sandbox } from '@/pages/Sandbox'
import { Helpers } from '@/pages/Helpers'
import { Models } from '@/pages/Models'
import { Files } from '@/pages/Files'
import { Auth } from '@/pages/Auth'

export const App = () => {
	const project = useApp((v) => v.project)

	return (
		<BrowserRouter>
			{!project ? (
				<Welcome />
			) : (
				<div className="flex h-screen min-h-0 flex-col divide-y divide-muted overflow-hidden bg-muted dark:bg-muted/40">
					<Header />

					<Routes>
						<Route path="/" element={<Models />} />
						<Route path="/details" element={<Details />} />
						<Route path="/auth" element={<Auth />} />
						<Route path="/sandbox" element={<Sandbox />} />
						<Route path="/environment" element={<Environment />} />
						<Route path="/helpers" element={<Helpers />} />
						<Route path="/files" element={<Files />} />

						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</div>
			)}
		</BrowserRouter>
	)
}
