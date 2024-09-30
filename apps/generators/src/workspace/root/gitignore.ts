const tmpl = () => {
	return `# Based on https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore

# Logs

logs
_.log
npm-debug.log_
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Dependency directories

node_modules/

# dotenv environment variable files

.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Stores VSCode versions used for testing VSCode extensions

.vscode-test

# Finder (MacOS) folder config
.DS_Store

v8-compile-cache-*
`
}

export default tmpl
