type RipplesProps = {
	rings?: number
	size?: number
	gap?: number
	hover?: boolean
}

export const Ripples = ({ rings = 4, size = 200, gap = 150, hover = true }: RipplesProps) => {
	return <Ripple ripplesRemaining={rings - 1} size={size} gap={gap} hover={hover} />
}

type RippleProps = {
	ripplesRemaining: number
	size: number
	gap: number
	hover: boolean
}

const Ripple = ({ ripplesRemaining, size, gap, hover }: RippleProps) => {
	return (
		<div
			className="rounded-full border flex items-center justify-center border-border/40 group-hover:bg-primary/10 bg-background"
			style={{
				width: `${size + ripplesRemaining * gap}px`,
				height: `${size + ripplesRemaining * gap}px`,
				transition: 'background 0.2s ease-in-out',
				transitionDelay: ripplesRemaining * 0.05 + 's',
			}}
		>
			{ripplesRemaining > 0 ? (
				<Ripple ripplesRemaining={ripplesRemaining - 1} size={size} gap={gap} hover={hover} />
			) : (
				<span className="text-red-500">&middot;</span>
			)}
		</div>
	)
}
