import dotenv from 'dotenv'
dotenv.config()

import { Client, IntentsBitField } from 'discord.js'

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
    ],
})
let roles = []
client.on('ready', () => { 
	console.log(`Logged in as ${client.user?.tag}!`) 
	console.log(updateRoles())
})
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//adds color role to user
client.on('interactionCreate', (interaction) => {
	if (!interaction.isChatInputCommand()) return
	
	if (interaction.commandName === 'name-color') {
		const hexColor = interaction.options.get('hex-color')
		if (!hexColorRegex.test(hexColor.value)) {
			interaction.reply('Invalid Hex Color')
			return
		}
		if (!findColorRoleByValue(hexColor.value)) {
			
			interaction.guild?.roles.create({
				name: hexColor.value,
				color: hexColor.value,
			})
			
			console.log(`Created role ${hexColor.value} for ${interaction.user.tag}`)
			updateRoles()
		}

		interaction.member.roles.add(findColorRoleByValue(hexColor.value))		
		interaction.reply({ content: `Added role with color ${hexColor.value} to your name`, ephemeral: true })
		console.log(`Added role with color ${hexColor.value} to ${interaction.user.tag}`)
	}

	if (interaction.commandName === 'delete-color') {

		const userRoles = interaction.member.roles.cache.filter(role => hexColorRegex.test(role.name))
		console.log(userRoles)

		if (!userRoles) {
			interaction.reply('You dont have a color role')
			return
		} 
		interaction.member.roles.remove(userRoles.first())
		console.log(`Deleted role ${userRoles.first().name} from ${interaction.user.tag}`)
		interaction.reply({content: 'Removed your color role', ephemeral: true})
		console.log(`Removed color role from ${interaction.user.tag}`)
		
	}
})

client.login(process.env.DISCORD_TOKEN)

function updateRoles(){
	const newRoles = []
	client.guilds.cache.forEach(guild => {
		guild.roles.cache.forEach(role => {
			newRoles.push(role)
		})
	})

	roles = newRoles
	const msg = {
		roles: roles.map(role => role.name),
		roleCount: roles.length,
	}
	return msg
}

function findColorRoleByValue(value) {
	return roles.find(role => role.name === value && hexColorRegex.test(role.name))
}