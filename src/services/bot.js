const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage

const _ = require('lodash')

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

        const randScene = new Scene('rand')
        randScene.enter(async ctx => {
            const genres = await this.api.getGenres()
            const randomGenres = _.sampleSize(genres, 10)
            const keys = _
                .chunk(randomGenres, 3)
                .map(chunk => chunk
                    .map(genre => Markup.callbackButton(genre.russian, `genre-${genre.id}`)))
            ctx.reply(
                'Пожалуйста, выберите жанр',
                Markup.inlineKeyboard(keys).extra()
            )
        })
        randScene.leave(async ctx => {
            const genreId = ctx.update.callback_query.data.split('-')[1]
            const anime = await this.api.findRandomByGenre(genreId)
            ctx.deleteMessage()
            return ctx.reply(
                `[${anime.russian}](${this.api.expandUrl(anime.url)})`,
                { parse_mode: 'Markdown' }
            )
        })
        randScene.on('callback_query', leave())
        randScene.on('message', (ctx) => ctx.reply('Пожалуйста, выберите жанр'))

        stage.register(topScene)
        stage.register(randScene)

        this.telegraf.use(session())
        this.telegraf.use(stage.middleware())

        this.telegraf.command('top', (ctx) => ctx.scene.enter('top'))
        this.telegraf.command('rand', (ctx) => ctx.scene.enter('rand'))
        this.telegraf.command('cancel', leave())

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
                        message_text: `[${anime.russian}](${this.api.expandUrl(anime.url)})`,
                        parse_mode: 'Markdown'
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
