const Telegraf = require('telegraf')
const fetch = require('node-fetch')

module.exports = class Bot {
    constructor({ token, webhookUrl, commands, dependencies: { api, templateEngine } }) {
        this.telegraf = new Telegraf(token, {
            telegram: {
                webhookReply: false
            }
        })
        this.commands = commands
        this.api = api
        this.templateEngine = templateEngine
        this.init()
        this.webhook = webhookUrl
    }

    init() {
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
