import dotenv from 'dotenv'
dotenv.config()

import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ],
})

client.login(process.env.DISCORD_TOKEN)

//create a listener on every message that contains a "?color" and a hex color, check that the hex code is valid 
//and change the color of the user's name to the hex code, if the role with the hex code doesn't exist, create it
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('?color')) {
        const hex = message.content.split(' ')[1]
        if (hex.length !== 6) {
            message.reply('Invalid hex code')
        } else {
            const role = message.guild.roles.cache.find(role => role.name === hex)
            if (role) {
                message.member.roles.add(role)
            } else {
                const newRole = await message.guild.roles.create({
                    name: hex,
                    color: hex
                })
                message.member.roles.add(newRole)
            }
        }
    }
}
