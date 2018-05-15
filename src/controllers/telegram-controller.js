exports.handleUpdate = async (ctx, next) => {
    ctx.bot.handleUpdate(ctx.request.body, ctx.res)
    ctx.body = ctx.request.body
    ctx.status = 201
    ctx.message = 'Telegram update has been successfully handled'
    next()
}
