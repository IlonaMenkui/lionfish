const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage

module.exports = class Bot {
    constructor({ token, webhookUrl, dependencies: { api, templateEngine } }) {
        this.telegraf = new Telegraf(token, {
            telegram: {
                webhookReply: false
            }
        })
        this.api = api
        this.init()
        this.webhook = webhookUrl
    }

    init() {
        const stage = new Stage()

        const topScene = new Scene('top')
        topScene.enter(ctx => ctx.reply('Пожалуйста, введите год'))
        topScene.leave(async ctx => {
            const year = Number.parseInt(ctx.message.text)
            const animes = await this.api.findTop15ByYear(year)
            return ctx.reply(
                !!animes.length
                    ? animes.map(anime => `[${anime.russian}](${this.api.expandUrl(anime.url)})\n`).join('')
                    : 'За данный год ничего не найдено',
                { parse_mode: 'Markdown' }
            )
        })
        topScene.hears(/^(19[5-9]\d|20[0-4]\d|2050)$/, leave())
        topScene.on('message', (ctx) => ctx.reply('Пожалуйста, введите год'))

        stage.register(topScene)

        this.telegraf.use(session())
        this.telegraf.use(stage.middleware())

        this.telegraf.command('top', (ctx) => ctx.scene.enter('top'))
        this.telegraf.command('top', (ctx) => ctx.scene.enter('random'))
        this.telegraf.command('cancel', leave())

        this.telegraf.command('ping', async ctx => {
            return ctx.reply('pong')
        })

        this.telegraf.on('inline_query', async ctx => {
            const limit = 20
            const page = Number.parseInt(ctx.inlineQuery.offset) || 1
            const animes = await this.api.findAnimeByName(ctx.inlineQuery.query, { page, limit })
            const results = animes
                .map(anime => ({
                    id: anime.id,
                    type: 'article',
                    title: anime.russian,
                    input_message_content: {
                        message_text: this.api.expandUrl(anime.url)
                    }
                }))
            return ctx.answerInlineQuery(results, {
                next_offset: page + 1
            })
        })
    }

    set webhook(webhookUrl) {
        this.telegraf.telegram.setWebhook(webhookUrl)
    }

    handleUpdate(update, webhookResponse) {
        this.telegraf.handleUpdate(update, webhookResponse)
    }
}
