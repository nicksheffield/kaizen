import { Logo } from '@/components/Logo'
import { ProjectHeader } from '@/components/ProjectHeader'
import { NavLink } from 'react-router-dom'

const tabStyle =
	'h-9 rounded-md flex items-center px-3 font-medium hover:bg-light/5 text-light/80 rounded-md text-sm aria-[current=page]:bg-light/10 aria-[current=page]:text-light'

export const Header = () => {
	return (
		<div className="flex items-center justify-between gap-4 overflow-hidden bg-dark/90 p-4 text-light dark:bg-background">
			<div className="flex items-center gap-4">
				<Logo />

				<div className="flex items-center gap-1">
					<NavLink to="/" className={tabStyle}>
						Models
					</NavLink>
					<NavLink to="/details" className={tabStyle}>
						Details
					</NavLink>
					<NavLink to="/auth" className={tabStyle}>
						Auth
					</NavLink>
					<NavLink to="/environment" className={tabStyle}>
						Environment
					</NavLink>
					<NavLink to="/helpers" className={tabStyle}>
						Helpers
					</NavLink>
					<NavLink to="/files" className={tabStyle}>
						Files
					</NavLink>
					<NavLink to="/sandbox" className={tabStyle}>
						Sandbox
					</NavLink>
				</div>
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
