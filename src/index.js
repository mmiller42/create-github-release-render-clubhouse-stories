import path from 'path'
import { readFile as _readFile } from 'fs'
import promisify from 'es6-promisify'
import Mustache from 'mustache'
import linkifyIt from 'linkify-it'
import Clubhouse from 'clubhouse-lib'
import flatten from 'lodash.flatten'
import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import uniqBy from 'lodash.uniqBy'

const readFile = promisify(_readFile)
const linkify = linkifyIt()
const templateCache = {}
const projectCache = {}

const DEFAULT_TEMPLATE = path.resolve(__dirname, 'defaultTemplate.md.hbs')

const createRenderer = config => {
  if (!isObject(config)) {
    throw new Error('config must be an object')
  }
  ;['token'].forEach(property => {
    if (!config[property]) {
      throw new Error(`${property} property is required`)
    }
  })
  forEach({ token: 'string', template: 'string' }, (type, property) => {
    const value = config[property]
    if (value !== undefined && typeof value !== type) {
      throw new Error(`${property} property must be of type ${type}`)
    }
  })

  const { token, template: templatePath = DEFAULT_TEMPLATE } = config

  const clubhouse = Clubhouse.create(token)

  return view => render(clubhouse, templatePath, view)
}

createRenderer.DEFAULT_TEMPLATE = DEFAULT_TEMPLATE

export default createRenderer

const render = async (clubhouse, templatePath, { pullRequests, ...view }) => {
  let fetchingTemplate = templateCache[templatePath]
  if (!fetchingTemplate) {
    fetchingTemplate = readFile(templatePath, 'utf8')
    templateCache[templatePath] = fetchingTemplate
  }

  const template = await fetchingTemplate
  const stories = await Promise.all(
    pullRequests.map(pullRequest => fetchStories(clubhouse, pullRequest))
  )

  return Mustache.render(template, {
    ...view,
    pullRequests: pullRequests.map((pullRequest, i) => ({
      ...pullRequest,
      stories: stories[i],
    })),
    storyIcon() {
      return {
        feature: ':eight_spoked_asterisk:',
        bug: ':bug:',
        chore: ':wrench:',
      }[this.type]
    },
  })
}

const fetchStories = async (clubhouse, pullRequest) => {
  return await Promise.all(
    extractStoryRefs(pullRequest).map(storyRef => fetchStory(clubhouse, storyRef))
  )
}

const extractStoryRefs = pullRequest => {
  const urlPattern = /^https:\/\/app\.clubhouse\.io\/.*\/story\/([0-9]+)\/.*$/
  const links = flatten(
    [pullRequest.body, ...flatten(pullRequest.comments.map(comment => comment.body))].map(
      body => linkify.match(body) || []
    )
  )

  const storyRefs = links
    .map(({ url }) => {
      const match = url && url.match(urlPattern)
      if (match) {
        const [url, id] = match
        return { url, id }
      } else {
        return null
      }
    })
    .filter(storyRef => storyRef)

  return uniqBy(storyRefs, 'id')
}

const fetchStory = async (clubhouse, { url, id }) => {
  const storyData = await clubhouse.getStory(id)

  let fetchingProject = projectCache[storyData.project_id]
  if (!fetchingProject) {
    fetchingProject = clubhouse.getProject(storyData.project_id)
    projectCache[storyData.project_id] = fetchingProject
  }

  const projectData = await fetchingProject

  return {
    id,
    url,
    title: storyData.name,
    type: storyData.story_type,
    project: projectData.abbreviation,
  }
}
