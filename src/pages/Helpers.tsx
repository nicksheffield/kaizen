import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/AppContext'
import { Model } from '@/lib/projectSchemas'
import { camelize } from '@/lib/utils'
import { ChevronDownIcon, DraftingCompassIcon, FilterIcon } from 'lucide-react'
import pluralize from 'pluralize'
import { plural, singular } from 'pluralize'
import { useState } from 'react'
import { toast } from 'sonner'

export const getSmallName = (model: Model) => singular(model.key || camelize(model.name))

export const Helpers = () => {
	const project = useApp((v) => v.project)

	const [filter, setFilter] = useState('')

	const copy = (text: string) => {
		navigator.clipboard.writeText(text)
		toast.success('Copied to clipboard')
	}

	const allMutations = (model: Model) => {
		const create = createMutation(model)
		const update = updateMutation(model)
		const del = deleteMutation(model)

		return `${create}

${update}

${del}

export const ${model.name}Mutations = {
	create: Create${model.name}.mutation,
	update: Update${model.name}.mutation,
	delete: Delete${model.name}.mutation,
}
`
	}

	const createMutation = (model: Model) => {
		return `export const Create${model.name} = {
	mutation: graphql(\`
		mutation Create${model.name}($data: [Create${model.name}Input!]!) {
			create${model.name}(data: $data) {
				id
			}
		}
	\`)
}`
	}

	const updateMutation = (model: Model) => {
		return `export const Update${model.name} = {
	mutation: graphql(\`
		mutation Update${model.name}($data: [Update${model.name}Input!]!) {
			update${model.name}(data: $data) {
				id
			}
		}
	\`)
}`
	}

	const deleteMutation = (model: Model) => {
		return `export const Delete${model.name} = {
	mutation: graphql(\`
		mutation Delete${model.name}($id: [ID!]!) {
			delete${model.name}(id: $id) {
				id
			}
		}
	\`)
}`
	}

	const queryById = (model: Model) => {
		return `export const View${model.name} = {
	query: graphql(\`
		query View${model.name}($id: ID!) {
			${getSmallName(model)}(id: $id) {
				id
				// Add fields here
			}
		}
	\`),
}`
	}

	const queryMany = (model: Model) => {
		return `export const Get${plural(model.name)} = {
	query: graphql(\`
		query Get${plural(model.name)}($page: Int, $limit: Int, $where: ${model.name}Filter, $orderBy: ${model.name}OrderBy, $orderDir: OrderDir) {
			${pluralize(getSmallName(model), 2)}(page: $page, limit: $limit, where: $where, orderBy: $orderBy, orderDir: $orderDir) {
				items {
					id
					// Add fields here
				}
				totalCount
			}
		}
	\`),
	context: { additionalTypenames: ['${model.name}'] },
}`
	}

	return (
		<div className="flex min-h-0 flex-1 flex-row">
			<ScrollArea className="flex-1">
				<div className="flex flex-col items-center gap-6 p-6">
					<div className="flex w-full max-w-5xl items-center justify-between border-0 border-b shadow-none">
						<div className="flex flex-col gap-2 py-6">
							<CardTitle className="flex items-center gap-2">
								<DraftingCompassIcon className="h-6 w-6" />
								Code Helpers
							</CardTitle>
							<CardDescription>
								Generate code snippets based on your projects configuration
							</CardDescription>
						</div>
					</div>

					<div className="grid w-full max-w-5xl grid-cols-[1fr,2fr] gap-6">
						<div className="flex flex-col gap-2">
							<div className="font-medium">URQL</div>
							<div className="text-sm text-muted-foreground">
								Generate urql queries and mutations based on your models
							</div>
						</div>

						<div className="flex flex-col gap-6">
							<div className="relative">
								<div className="pointer-events-none absolute left-3 flex h-full items-center">
									<FilterIcon className="w-4 opacity-50" />
								</div>
								<Input
									value={filter}
									onChange={(e) => setFilter(e.target.value)}
									placeholder="Filter models..."
									className="pl-9"
								/>
							</div>

							<Card className="divide-y divide-input overflow-hidden rounded-md border border-input">
								{project?.models
									.filter((x) => x.name.toLowerCase().trim().includes(filter.toLowerCase().trim()))
									.map((model) => (
										<div
											key={model.id}
											className="flex items-center justify-between gap-4 px-4 py-3"
										>
											<div className="text-sm font-medium">{model.name}</div>

											<div className="flex items-center gap-4">
												<Button
													variant="outline"
													size="sm"
													onClick={() => copy(queryById(model))}
												>
													Query by id
												</Button>

												<Button
													variant="outline"
													size="sm"
													onClick={() => copy(queryMany(model))}
												>
													Query many
												</Button>

												<div className="flex items-center">
													<Button
														variant="outline"
														size="sm"
														className="rounded-r-none"
														onClick={() => copy(allMutations(model))}
													>
														Mutations
													</Button>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="outline"
																size="icon-sm"
																className="-ml-px rounded-l-none"
															>
																<ChevronDownIcon className="w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem
																onClick={() => copy(createMutation(model))}
															>
																Create only
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => copy(updateMutation(model))}
															>
																Update only
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => copy(deleteMutation(model))}
															>
																Delete only
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</div>
									))}
							</Card>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	)
}
