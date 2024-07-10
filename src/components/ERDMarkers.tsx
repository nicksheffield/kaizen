// https://reactflow.dev/docs/examples/edges/markers/

// match this with index.css -> .react-flow .react-flow__edge-path
const stroke = 'stroke-gray-300 dark:stroke-gray-600'

export const ERDMarkers = () => {
	return (
		<svg
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: 0,
				height: 0,
			}}
		>
			<defs>
				<marker
					id="hasMany"
					viewBox="0 0 32 32"
					markerHeight={32}
					markerWidth={32}
					refX={29}
					refY={16}
					orient="auto-start-reverse"
				>
					{(() => {
						const h = 32
						const w = 32

						return (
							<g className={stroke}>
								<line x1={w / 2} y1={h / 2} x2={w - 3} y2={10} strokeWidth="1" />
								<line x1={w / 2} y1={h / 2} x2={w - 3} y2={h - 10} strokeWidth="1" />
								<circle cx={w / 2 - 2} cy={w / 2} r={3} className="fill-muted" />
							</g>
						)
					})()}
				</marker>

				<marker
					id="hasManyRequired"
					viewBox="0 0 32 32"
					markerHeight={32}
					markerWidth={32}
					refX={29}
					refY={16}
					orient="auto-start-reverse"
				>
					{(() => {
						const h = 32
						const w = 32

						return (
							<g className={stroke}>
								<line x1={w / 2 + 0} y1={10} x2={w / 2 + 0} y2={h - 10} strokeWidth="1" />
								<line x1={w / 2} y1={h / 2} x2={w - 3} y2={10} strokeWidth="1" />
								<line x1={w / 2} y1={h / 2} x2={w - 3} y2={h - 10} strokeWidth="1" />
							</g>
						)
					})()}
				</marker>

				<marker
					id="hasOne"
					viewBox="0 0 32 32"
					markerHeight={32}
					markerWidth={32}
					refX={29}
					refY={16}
					orient="auto-start-reverse"
				>
					{(() => {
						const h = 32
						const w = 32

						return (
							<g className={stroke}>
								<line x1={w / 2 + 5} y1={10} x2={w / 2 + 5} y2={h - 10} strokeWidth="1" />
								<circle cx={w / 2 - 2} cy={w / 2} r={3} className="fill-background" />
							</g>
						)
					})()}
				</marker>

				<marker
					id="hasOneRequired"
					viewBox="0 0 32 32"
					markerHeight={32}
					markerWidth={32}
					refX={29}
					refY={16}
					orient="auto-start-reverse"
				>
					{(() => {
						const h = 32
						const w = 32

						return (
							<g className={stroke}>
								<line x1={w / 2 - 2} y1={10} x2={w / 2 - 2} y2={h - 10} strokeWidth="1" />
								<line x1={w / 2 + 5} y1={10} x2={w / 2 + 5} y2={h - 10} strokeWidth="1" />
							</g>
						)
					})()}
				</marker>
			</defs>
		</svg>
	)
}
