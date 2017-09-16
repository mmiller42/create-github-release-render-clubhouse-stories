# create-github-release-render-clubhouse-stories [![CircleCI](https://circleci.com/gh/mmiller42/create-github-release-render-clubhouse-stories.svg?style=svg)](https://circleci.com/gh/mmiller42/create-github-release-render-clubhouse-stories)

Render function for use with [`create-github-release`](https://github.com/mmiller42/create-github-release) to render pull requests with associated Clubhouse stories.

Extends the default template to render another column in the pull requests table with details about any Clubhouse stories that were referenced in the pull request comments by URL.

## Installation

```bash
npm install --save-dev create-github-release-render-clubhouse-stories
```

## API

### Configuration

The configuration file must export an object, which can have the following properties:

| Property   | Type     | Description                                                                                    | Default                                                  |
| ---------- | -------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `token`    | string   | Your Clubhouse API token. [Generate one](https://app.clubhouse.io/settings/account/api-tokens) | *Required*                                               |
| `template` | string   | The path to a Mustache template that will be used to generate the release notes.               | [`DEFAULT_TEMPLATE`](src/defaultTemplate.md.hbs)         |

### Example

```js
// github-release.config.js
const createRenderer = require('create-github-release-render-clubhouse-stories')

module.exports = {
  authenticateOptions: {
    type: 'oauth',
    token: 'b5ef45e4a2c245a5a4243b2882034a9f',
  },
  owner: 'mmiller42',
  repo: 'html-webpack-externals-plugin',
  render: createRenderer({
    token: '4f4e84744f9f47788468fc1f2d570329',
  }),
}
```
