import { REST, Routes, ApplicationCommandOptionType } from 'discord.js';
import dotenv from 'dotenv'
dotenv.config()

const commands = [
    {
        name: 'name-color',
        description: 'Change your name color',
        options: [
            {
                name: 'hex-color',
                description: 'Hex Code of a Color',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ]
    },
    {
        name: 'delete-color',
        description: 'Delete your name color',
    }
]

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...')

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully registered slash commands')
    } catch (error) {
        console.log('An Error accured')
    }
})()