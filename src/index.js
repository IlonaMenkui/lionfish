const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')

const { Api, Bot } = require('./services')
const { telegramController } = require('./controllers')

const server = module.exports = new Koa()

server.context.bot = new Bot({
    token: process.env.LF_APP_BOT_TOKEN,
    webhookUrl: `${process.env.LF_LB_URL}/api/telegram/updates`,
    dependencies: {
        api: new Api({ baseUrl: 'https://shikimori.org' })
    }
})

const telegramRouter = Router({ prefix: '/api/telegram' })

telegramRouter
    .post('/updates', telegramController.handleUpdate)

server.use(logger())
server.use(bodyParser())
server.use(telegramRouter.middleware())

server.listen(process.env.LF_SERVER_PORT || 8080, () => {
    console.log(`Lionfish application started!`)
})
