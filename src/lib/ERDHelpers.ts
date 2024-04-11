import { type Node } from 'reactflow'
import { AttributeType, Project, type Model, type Relation } from './projectSchemas'
import { plural, singular } from 'pluralize'
import { camelize } from '@/lib/utils'

export const getSourceName = (rel: Relation, nodes: Node<Model>[]) => {
	const sourceCardinality = rel.type === 'oneToMany' || rel.type === 'oneToOne' ? 'one' : 'many'
	const sourceModel = nodes.find((x) => x.data.id === rel.sourceId)?.data

	return sourceCardinality === 'one'
		? `${singular(rel.sourceName || sourceModel?.key || camelize(sourceModel?.name || ''))}${
				rel.optional ? '?' : ''
			}`
		: plural(rel.sourceName || sourceModel?.key || camelize(sourceModel?.name || ''))
}

export const getTargetName = (rel: Relation, nodes: Node<Model>[]) => {
	const targetCardinality = rel.type === 'oneToMany' || rel.type === 'manyToMany' ? 'many' : 'one'
	const targetModel = nodes.find((x) => x.data.id === rel.targetId)?.data

	return targetCardinality === 'one'
		? `${singular(rel.targetName || targetModel?.key || camelize(targetModel?.name || ''))}${
				rel.optional ? '?' : ''
			}`
		: plural(rel.targetName || targetModel?.key || camelize(targetModel?.name || ''))
}

export const getLogicalRecommend = (name: string): AttributeType | undefined => {
	if (name.startsWith('is') && name.length > 3) return 'boolean'
	if (name.endsWith('At')) return 'datetime'
	if (name.endsWith('Date')) return 'date'
	if (name.endsWith('Time')) return 'time'
}

export const isReservedKeyword = (keyword: string, isTable: boolean = false) => {
	return false
	const keywords = [
		'ACCESSIBLE',
		'ADD',
		'ALL',
		'ALTER',
		'ANALYZE',
		'AND',
		'AS',
		'ASC',
		'ASENSITIVE',
		'BEFORE',
		'BETWEEN',
		'BIGINT',
		'BINARY',
		'BLOB',
		'BOTH',
		'BY',
		'CALL',
		'CASCADE',
		'CASE',
		'CHANGE',
		'CHAR',
		'CHARACTER',
		'CHECK',
		'COLLATE',
		'COLUMN',
		'CONDITION',
		'CONSTRAINT',
		'CONTINUE',
		'CONVERT',
		'CREATE',
		'CROSS',
		'CURRENT_DATE',
		'CURRENT_ROLE',
		'CURRENT_TIME',
		'CURRENT_TIMESTAMP',
		'CURRENT_USER',
		'CURSOR',
		'DATABASE',
		'DATABASES',
		'DAY_HOUR',
		'DAY_MICROSECOND',
		'DAY_MINUTE',
		'DAY_SECOND',
		'DEC',
		'DECIMAL',
		'DECLARE',
		'DEFAULT',
		'DELAYED',
		'DELETE',
		'DELETE_DOMAIN_ID',
		'DESC',
		'DESCRIBE',
		'DETERMINISTIC',
		'DISTINCT',
		'DISTINCTROW',
		'DIV',
		'DO_DOMAIN_IDS',
		'DOUBLE',
		'DROP',
		'DUAL',
		'EACH',
		'ELSE',
		'ELSEIF',
		'ENCLOSEDESCAPED',
		'EXCEPTEXISTS',
		'EXIT',
		'EXPLAIN',
		'FALSE',
		'FETCH',
		'FLOAT',
		'FLOAT4',
		'FLOAT8',
		'FOR',
		'FORCE',
		'FOREIGN',
		'FROMFULLTEXT',
		'GENERAL',
		'GRANT',
		'GROUP',
		'HAVING',
		'HIGH_PRIORITY',
		'HOUR_MICROSECOND',
		'HOUR_MINUTE',
		'HOUR_SECOND',
		'IF',
		'IGNORE',
		'IGNORE_DOMAIN_IDS',
		'IGNORE_SERVER_IDS',
		'IN',
		'INDEX',
		'INFILE',
		'INNER',
		'INOUT',
		'INSENSITIVE',
		'INSERT',
		'INT',
		'INT1',
		'INT2',
		'INT3',
		'INT4',
		'INT8',
		'INTEGER',
		'INTERSECTINTERVAL',
		'INTO',
		'IS',
		'ITERATE',
		'JOIN',
		'KEY',
		'KEYS',
		'KILL',
		'LEADING',
		'LEAVE',
		'LEFT',
		'LIKE',
		'LIMIT',
		'LINEAR',
		'LINES',
		'LOAD',
		'LOCALTIME',
		'LOCALTIMESTAMP',
		'LOCK',
		'LONG',
		'LONGBLOB',
		'LONGTEXT',
		'LOOP',
		'LOW_PRIORITY',
		'MASTER_HEARTBEAT_PERIOD',
		'MASTER_SSL_VERIFY_SERVER_CERT',
		'MATCH',
		'MAXVALUE',
		'MEDIUMBLOB',
		'MEDIUMINT',
		'MEDIUMTEXT',
		'MIDDLEINT',
		'MINUTE_MICROSECOND',
		'MINUTE_SECOND',
		'MOD',
		'MODIFIES',
		'NATURAL',
		'NOT',
		'NO_WRITE_TO_BINLOG',
		'NULL',
		'NUMERIC',
		'OFFSETON',
		'OPTIMIZE',
		'OPTION',
		'OPTIONALLY',
		'OR',
		'ORDER',
		'OUT',
		'OUTER',
		'OUTFILE',
		'OVER',
		'PAGE_CHECKSUM',
		'PARSE_VCOL_EXPR',
		'PARTITION',
		'PRECISION',
		'PRIMARY',
		'PROCEDURE',
		'PURGE',
		'RANGE',
		'READ',
		'READS',
		'READ_WRITE',
		'REALRECURSIVE',
		'REF_SYSTEM_ID',
		'REFERENCES',
		'REGEXP',
		'RELEASE',
		'RENAME',
		'REPEAT',
		'REPLACE',
		'REQUIRE',
		'RESIGNAL',
		'RESTRICT',
		'RETURN',
		'RETURNING',
		'REVOKE',
		'RIGHT',
		'RLIKE',
		'ROW_NUMBERROWS',
		'SCHEMA',
		'SCHEMAS',
		'SECOND_MICROSECOND',
		'SELECT',
		'SENSITIVE',
		'SEPARATOR',
		'SET',
		'SHOW',
		'SIGNAL',
		'SLOW',
		'SMALLINT',
		'SPATIAL',
		'SPECIFIC',
		'SQL',
		'SQLEXCEPTION',
		'SQLSTATE',
		'SQLWARNING',
		'SQL_BIG_RESULT',
		'SQL_CALC_FOUND_ROWS',
		'SQL_SMALL_RESULT',
		'SSL',
		'STARTING',
		'STATS_AUTO_RECALC',
		'STATS_PERSISTENT',
		'STATS_SAMPLE_PAGES',
		'STRAIGHT_JOIN',
		'TABLE',
		'TERMINATED',
		'THEN',
		'TINYBLOB',
		'TINYINT',
		'TINYTEXT',
		'TO',
		'TRAILING',
		'TRIGGER',
		'TRUE',
		'UNDO',
		'UNION',
		'UNIQUE',
		'UNLOCK',
		'UNSIGNED',
		'UPDATE',
		'USAGE',
		'USE',
		'USING',
		'UTC_DATE',
		'UTC_TIME',
		'UTC_TIMESTAMP',
		'VALUES',
		'VARBINARY',
		'VARCHAR',
		'VARCHARACTER',
		'VARYING',
		'WHEN',
		'WHERE',
		'WHILE',
		'WINDOWWITH',
		'WRITE',
		'XOR',
		'YEAR_MONTH',
		'ZEROFILL',
	]

	if (isTable) keywords.push('WINDOW')

	return keywords.includes(keyword.toUpperCase())
}

export type AttrTypeRecommend = {
	name: string
	recommendedType: string | undefined
}

export const getAttrTypeRecommends = (project?: Project) => {
	if (!project) return []

	const attrs = project.models.map((x) => x.attributes).flat()

	const recommends = attrs.reduce<AttrTypeRecommend[]>((arr, attr) => {
		const otherAttrs = attrs.filter((x) => x.name.trim().toLowerCase() === attr.name.trim().toLowerCase())

		const counters = otherAttrs.reduce<Record<string, number>>((acc, attr) => {
			acc[attr.type] = (acc?.[attr.type] || 0) + 1
			return acc
		}, {})

		return [
			...arr,
			{
				name: attr.name,
				recommendedType: otherAttrs.map((x) => x.type).sort((a, b) => counters[b] - counters[a])[0],
			},
		]
	}, [])

	return recommends
}
