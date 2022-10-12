const db = require('better-sqlite3')('./database/mhgu.db')

const Telegraph = require('telegra.ph')


function startMessage(firstname) {
    return `Hello *${firstname}*. Please, type ` + '`/help`' + ' to see how can I help you!'
}

//set case insensitive for search
function helpMessage(ctx) {

    const msg = `Hi, *${ctx.message.from.first_name}*!\n
There’s only *two* basic options available here. Check this out: \n\n` +
        '`/monster Rathalos` - _to see Rathalos weaknesses_\n\n`/drop Rathalos LR` - _to see Rathalos LR droplist_'

    ctx.replyWithDocument('https://media.giphy.com/media/JSwGg4kvtbFGkW3gZr/giphy.gif',
        {

            caption: msg,
            parse_mode: "Markdown"

        })

}

function monsterNameCase(str) {

    let splitStr = str.toLowerCase().split(' ')

    for (let i = 0; i < splitStr.length; i++) {

        if(splitStr.toString().indexOf('-') != -1){

            if(splitStr[i] === 'lao-shan'){ 
                return 'Lao-Shan Lung'
            }
            if(splitStr[i] === 'ahtal-ka'){
                return 'Ahtal-Ka'
            }

        }

        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
    }

    return splitStr.join(' ')

}

async function showMonstersWeaknesses(bot, ctx) {

    //format output data

    function setObjectProperties(obj) {

        delete obj._id
        delete obj.monster_id
        delete obj._id
        delete obj.state
        delete obj.meat
        let list = ''

        Object.keys(obj).forEach(function (key) {

            if (obj[key] === 0) {

                delete obj[key]

            }

            return obj

        })

        Object.keys(obj).forEach((key => {

            if (obj['pitfall_trap'] === 1) {

                obj['pitfall_trap'] = 'Yes'

            }

            if (obj['shock_trap'] === 1) {

                obj['shock_trap'] = 'Yes'

            }

            if (obj['flash_bomb'] === 1) {

                obj['flash_bomb'] = 'Yes'

            }

            if (obj['sonic_bomb'] === 1) {

                obj['sonic_bomb'] = 'Yes'

            }

            if (obj['dung_bomb'] === 1) {

                obj['dung_bomb'] = 'Yes'

            }

            return obj

        }))

        Object.keys(obj).forEach(function (key) {

            list = list + `${key}: ${obj[key]}\n`

        })

        list = list
            .replace(/fire:/, '🔥 Fire: ')
            .replace(/water:/, '💧 Water: ')
            .replace(/thunder:/, '⚡️ Thunder: ')
            .replace(/ice:/, '❄️ Ice: ')
            .replace(/dragon:/, '🐉 Dragon: ')
            .replace(/poison:/, '☠️ Poison: ')
            .replace(/paralysis:/, '✨ Paralysis: ')
            .replace(/sleep:/, '😴 Sleep: ')
            .replace(/pitfall_trap:/, 'Pitfall Trap: ')
            .replace(/shock_trap:/, 'Shock Trap: ')
            .replace(/flash_bomb:/, 'Flash Bomb: ')
            .replace(/sonic_bomb:/, 'Sonic Bomb: ')
            .replace(/dung_bomb:/, 'Dung Bomb: ')

        return list

    }

    const regex = / .+/

    if (!regex.test(ctx.message.text)) {

        return ctx.replyWithMarkdown(`You did something wrong 🤔, please try again!`)

    }

    let [monsterName] = ctx.message.text.match(regex)

    monsterName = monsterName.trim()
    const teste = monsterNameCase(monsterName)

    if (!regex.test(ctx.message.text)) {

        return ctx.replyWithMarkdown(`You did something wrong 🤔, please try again!`)

    }

    const monsterId = await db.prepare('SELECT _id FROM monsters WHERE name = ?').get(monsterNameCase(monsterName))

    if (monsterId === undefined) {

        return ctx.replyWithMarkdown(`There's no weakness information about *${monsterNameCase(monsterName)}* on database, please try a different one!`)

    }

    const monsterWeakness = await db.prepare('SELECT * FROM monster_weakness WHERE monster_id = ?').get(monsterId._id)

    const monsterIcon = await db.prepare('SELECT icon_name FROM monsters WHERE _id = ?').get(monsterId._id)

    if (monsterWeakness === undefined) {

        return ctx.replyWithMarkdown(`There's no weakness information about *${monsterNameCase(monsterName)}* on database, please try a different one!`)

    }

    const list = await setObjectProperties(monsterWeakness)

    bot.telegram.sendPhoto(ctx.chat.id, { source: `./icons_monsters_genU/${monsterIcon.icon_name}.png` },
        {
            caption: list

        }, { parse_mode: "Markdown" })

}

async function showMonstersDroplist(bot, ctx) {

    function createTelegraph() {

        const client = new Telegraph()

        client.token = process.env.TELEGRAPH_TOKEN

        client.createPage(`${monsterNameCase(monsterName)}`,
            [{ 'tag': 'p', 'children': [list] }],
            'GatheringHall - BOT', 'http://t.me/GatheringHall')
            .then(page => {

                bot.telegram.sendMessage(ctx.chat.id, page.url)

            })

    }

    const regex = / .+ /

    if (!regex.test(ctx.message.text)) {

        return ctx.replyWithMarkdown(`You did something wrong 🤔, please try again!`)

    }

    let [monsterName] = ctx.message.text.match(regex)

    monsterName = monsterName.trim()

    const monsterId = await db.prepare('SELECT _id FROM monsters WHERE name = ?').get(monsterNameCase(monsterName))

    if (!(/lr$|hr$|g$/i).test(ctx.message.text)) {

        return ctx.replyWithMarkdown(`You didn't type a rank for that monster, please try again!`)

    }

    const [rank] = ctx.message.text.match(/lr$|hr$|g$/i)

    if (monsterId === undefined) {

        return ctx.replyWithMarkdown(`There's no monster called *${monsterNameCase(monsterName)}* on database, please try a different one!`)

    }

    const droplist = await db.prepare('SELECT * FROM hunting_rewards WHERE monster_id = ? AND rank = ?').all(monsterId._id, rank.toUpperCase())

    if (droplist.length === 0) {

        return ctx.replyWithMarkdown(`There's no droplist for *${monsterNameCase(monsterName)}* in *${rank.toUpperCase()}* , please try a different rank!`)

    }

    let monsterIcon = await db.prepare('SELECT icon_name FROM monsters WHERE _id = ?').get(monsterId._id)

    monsterIcon = `./icons_monsters_genU/${monsterIcon.icon_name}.png`

    let list = ''
    let newCondition = {}
    let MyConditions = []

    Object.keys(droplist).forEach(function (key) {

        MyConditions[key] = droplist[key].condition

    })

    newCondition = MyConditions.filter((item, index) => MyConditions.indexOf(item) === index)

    async function getConditions(obj, conditionName) {

        const idx = 0

        obj.map(async (element, index) => {

            const itemId = element.item_id

            const itemName = await db.prepare('SELECT name FROM items WHERE _id = ?').get(itemId)

            if (element.condition === conditionName[idx]) {

                list = list + `\n✪︎︎︎${element.condition}\n\n`

                conditionName.shift()

            }

            if (index < obj.length) {

                list = list + `${itemName.name} ➡️ ${element.percentage}%\n`

            }

        })

    }

    await getConditions(droplist, newCondition)

    if (list.length > 1023) {

        createTelegraph()

    } else {

        await bot.telegram.sendPhoto(ctx.chat.id, { source: monsterIcon },
            {
                caption: list,
                parse_mode: "Markdown"
            })
    }

}

module.exports = {
    showMonstersWeaknesses, showMonstersDroplist, helpMessage, startMessage
}