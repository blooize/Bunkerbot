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
	updateRoles()
	console.log({
		roles: roles.map(role => role.name),
		roleCount: roles.length,
	})
})
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//adds color role to user
client.on('interactionCreate', (interaction) => {
	if (!interaction.isChatInputCommand()) return
	try {
		if (interaction.commandName === 'name-color') {
			const hexColor = interaction.options.get('hex-color')
			if (!hexColorRegex.test(hexColor.value)) {
				interaction.reply({content: 'Invalid Hex Code', ephemeral: true})
				return
			}

			if (interaction.member?.roles.cache.find(role => hexColorRegex.test(role.name))) {
				interaction.reply({content: 'You already have a color role', ephemeral: true})
				return
			}

			if (!findColorRoleByValue(hexColor.value)) {

				interaction.guild.roles.create({
					name: hexColor.value,
					color: hexColor.value,
				})
				console.log(client.guilds?.roles.cache.map(role => role.name))
				console.log(`Created role ${hexColor.value} for ${interaction.user.tag}`)
				updateRoles()
			}

			interaction.member?.roles.add(findColorRoleByValue(hexColor.value))		
			interaction.reply({ content: `Added role with color ${hexColor.value} to your name`, ephemeral: true })
			console.log(`Added role with color ${hexColor.value} to ${interaction.user.tag}`)
		}
	} catch (error) {
		interaction.reply({ content: 'It seems you entered your slash command wrongly.', ephemeral: true })
		console.log({
			error: error,
			interaction: interaction,
		})
	}
	
	try {
		if (interaction.commandName === 'delete-color') {

			const userRoles = interaction.member.roles.cache.filter(role => hexColorRegex.test(role.name))
			console.log(userRoles)
	
			if (!userRoles) {
				interaction.reply({content: 'You dont seem to have a role.', ephemeral: true})
				return
			} 
			interaction.member.roles.remove(userRoles.first())
			console.log(`Deleted role ${userRoles.first().name} from ${interaction.user.tag}`)
			interaction.reply({content: 'Removed your color role', ephemeral: true})
			console.log(`Removed color role from ${interaction.user.tag}`)
			
		}
	} catch (error) {
		interaction.reply({ content: 'It seems you entered your slash command wrongly.', ephemeral: true })
		console.log({
			error: error,
			interaction: interaction,
		})
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
}

function findColorRoleByValue(value) {
	return roles.find(role => role.name === value && hexColorRegex.test(role.name))
}