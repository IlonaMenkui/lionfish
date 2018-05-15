const Telegraf = require('telegraf')

module.exports = class Bot {
    constructor({ token, webhookUrl, commands, dependencies: { api, templateEngine } }) {
        this.telegraf = new Telegraf(token)
        this.commands = commands
        this.templateEngine = templateEngine
        this.init()
        this.webhook = webhookUrl
    }

    init() {
        this.telegraf.command('ping', async ctx => {
            ctx.reply('pong')
        })
    }

    set webhook(webhookUrl) {
        this.telegraf.telegram.setWebhook(webhookUrl)
    }

    handleUpdate(update, webhookResponse) {
        this.telegraf.handleUpdate(update, webhookResponse)
    }
}
