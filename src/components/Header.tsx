import { Logo } from '@/components/Logo'
import { ProjectHeader } from '@/components/ProjectHeader'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocation, useNavigate } from 'react-router-dom'

const tabStyle =
	'hover:bg-light/5 text-light/80 rounded-md mx-1 text-sm data-[state=active]:bg-light/10 data-[state=active]:text-light'

export const Header = () => {
	const { pathname } = useLocation()
	const navigate = useNavigate()

	return (
		<div className="flex items-center justify-between gap-4 overflow-hidden bg-dark/90 p-4 text-light dark:bg-background">
			<div className="flex items-center gap-4">
				<Logo />

				<Tabs value={pathname} onValueChange={(val) => navigate(val)}>
					<TabsList className="w-full justify-start rounded-none bg-transparent">
						<TabsTrigger value="/" className={tabStyle}>
							{/* <DatabaseIcon className="w-4 mr-2" /> */}
							Models
						</TabsTrigger>
						<TabsTrigger value="/details" className={tabStyle}>
							{/* <BoltIcon className="w-4 mr-2" /> */}
							Details
						</TabsTrigger>
						<TabsTrigger value="/auth" className={tabStyle}>
							{/* <FingerprintIcon className="w-4 mr-2" /> */}
							Auth
						</TabsTrigger>
						<TabsTrigger value="/environment" className={tabStyle}>
							{/* <TentTreeIcon className="w-4 mr-2" /> */}
							Environment
						</TabsTrigger>
						<TabsTrigger value="/helpers" className={tabStyle}>
							{/* <DraftingCompassIcon className="w-4 mr-2" /> */}
							Helpers
						</TabsTrigger>
						<TabsTrigger value="/files" className={tabStyle}>
							{/* <TelescopeIcon className="w-4 mr-2" /> */}
							Files
						</TabsTrigger>
						<TabsTrigger value="/sandbox" className={tabStyle}>
							{/* <FolderCodeIcon className="w-4 mr-2" /> */}
							Sandbox
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<ProjectHeader />

			{/* <div className="flex items-center justify-end gap-4">
					<Button variant="link" asChild>
						<a href="https://docs.kz-app.com" target="_blank" rel="noreferrer">
							Docs
						</a>
					</Button>
				</div> */}
		</div>
	)
}
