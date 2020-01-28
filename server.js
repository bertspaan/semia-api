const axios = require('axios')
const H = require('highland')
const FlexSearch = require('flexsearch')
const express = require('express')
const cors = require('cors')
const Sequelize = require('sequelize')
const EventEmitter = require('events')

const app = express()
const index = new FlexSearch({
  doc: {
    id: 'videoId',
    field: [
      'data:title',
      'data:description'
    ]
  }
})

app.use(cors())

let Video

const APP_TITLE = 'SEMIA API'
const BASE_URL = 'https://semia-api.glitch.me'
const DATA_URL = 'https://cdn.glitch.com/b5f25577-7d51-4cc9-8e41-a994f9b499e7%2Fapi-data.ndjson?v=1580154680486'
const SEARCH_RESULTS = 25

let loading = new EventEmitter()

const waitOnData = () => new Promise((resolve) => loading.once('done', () => {    
  resolve()
  loading = undefined
}))

const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false,
  storage: '.data/database.sqlite',
  operatorsAliases: { $all: Sequelize.Op.all }
})

async function loadVideosFromUrl (url) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Loading data from URL: ${url}`)
      const response = await axios({
        url,
        method: 'get',
        responseType: 'stream'
      })

      H(response.data)
        .split()
        .compact()
        .map(JSON.parse)
        .map((video) => ({
          videoId: video.id,
          data: video
        }))
        .toArray((videos) => {
          console.log(`${videos.length} videos loaded from URL!`)
          resolve(videos)
        })
    } catch (err) {
      reject(err)
    }
  })
}

H(loadVideosFromUrl(DATA_URL))
  .flatten()
  .each((video) => {
    index.add({
      videoId: video.videoId,
      data: {
        title: video.data.title,
        description: video.data.description,
        length: video.data.length
      }
    })
  })
  .done(() => {
    waitOnData()
    loading.emit('done')
    console.log('Done indexing!')
  })

async function loadData () {
  let count = await Video.count()
  console.log(`${count} videos found in database`)

  if (count === 0) {
    const videos = await loadVideosFromUrl(DATA_URL)
    console.log(`Bulk loading ${videos.length} videos into database`)

    await Video.bulkCreate(videos)
    count = await Video.count()
    console.log(`Loaded ${count} videos!`)
  }
}

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')

    Video = sequelize.define('videos', {
      videoId: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      data: {
        type: Sequelize.JSON
      }
    }, {})
    Video.sync()

    loadData()
  })
  .catch((err) => {
    console.error('Unable to connect to the database: ', err)
  })

app.get('/search', async (req, res) => {
  const query = req.query.q

  if (!query) {
    res.status(400).send('Use the q parameter!')
  }

  if (loading) {
    await waitOnData()
  }

  const results = await index.search(query, SEARCH_RESULTS)
  res.send(results)
})

app.get('/videos/:videoId', async (req, res) => {
  const videoId = parseInt(req.params.videoId)

  if (loading) {
    await waitOnData()
  }

  const video = await Video.findOne({
    where: {
      videoId: videoId
    }
  })

  if (!video) {
    res.status(404).send('Not found...')
    return
  }

  res.send(video.data)
})

app.get('/', async (req, res) => {
  res.send({
    title: APP_TITLE,
    examples: [
      '/videos/98168',
      '/search?q=afsluitdijk'
    ].map((path) => `${BASE_URL}${path}`)
  })
})

app.listen(process.env.PORT)
console.log(`${APP_TITLE} started`)
module.exports = app
