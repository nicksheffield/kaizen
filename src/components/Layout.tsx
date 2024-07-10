import { Header } from '@/components/Header'
import { Outlet } from 'react-router-dom'
// import { Sidebar } from '@/components/Sidebar'

export const Layout = () => {
	return (
		<div className="flex h-screen min-h-0 flex-col overflow-hidden bg-muted">
			<Header />

			<Outlet />
		</div>
	)
}
