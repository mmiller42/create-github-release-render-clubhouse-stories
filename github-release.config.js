const path = require('path')

const MAX_CHANGES_TO_SHOW = 80
const EXTS_TO_SHOW = ['.css', '.html', 'js', '.json', '.jsx', '.md', '.scss', '.yml']

module.exports = {
	authenticateOptions: {
		type: 'oauth',
		token: process.env.GIT_OAUTH_TOKEN,
	},
	owner: 'mmiller42',
	repo: 'create-github-release-render-clubhouse-stories',
	showDiff: ({ filename, changes }) => {
		const ext = path.extname(filename)
		return changes <= MAX_CHANGES_TO_SHOW && (!ext || EXTS_TO_SHOW.includes(ext))
	},
}
