import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Environment } from '@/pages/Environment'
import { Layout } from '@/components/Layout'
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
			<Routes>
				{!project ? (
					<Route path="*" element={<Welcome />} />
				) : (
					<Route path="/" element={<Layout />}>
						<Route path="/" element={<Models />} />
						<Route path="/details" element={<Details />} />
						<Route path="/auth" element={<Auth />} />
						<Route path="/sandbox" element={<Sandbox />} />
						<Route path="/environment" element={<Environment />} />
						<Route path="/helpers" element={<Helpers />} />
						<Route path="/files" element={<Files />} />

						<Route path="*" element={<Navigate to="/" />} />
					</Route>
				)}
			</Routes>
		</BrowserRouter>
	)
}
