const { bot } = require('./web')

const { showMonstersWeaknesses, showMonstersDroplist, helpMessage } = require('./functions')

async function main() {

    try {

        //Welcome Message

        bot.start((ctx) => ctx.replyWithMarkdown(`Hello *${ctx.message.from.first_name}*. Please, type ` + '`/help`' + ' to see how can I help you!'))

        //Show Monsters Weaknesses

        bot.command('monster', async (ctx) => {

            showMonstersWeaknesses(bot, ctx)

        })

        //Show Monsters Droplist

        bot.command('drop', async (ctx) => {

            showMonstersDroplist(bot, ctx)

        })

        //Show Help
        
        bot.hears('/help@gatheringhall_bot', (ctx) => helpMessage(ctx))

        bot.help((ctx) => helpMessage(ctx))

    } catch (error) {

        console.error('Deu RUIM', error)

    }

}

main()