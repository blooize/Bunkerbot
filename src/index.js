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
	printRoles()
})
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//adds color role to user
client.on('interactionCreate',  async (interaction) => {
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

			if (!findRoleByValue(interaction.user.tag)) {
				console.log('entered creation')
				await interaction.guild.roles.create({
					name: interaction.user.tag,
					color: hexColor.value,
				}).then(console.log(`Created role ${interaction.user.tag}`))
				
				updateRoles()
			}
			setTimeout(() => { 
				interaction.member.roles.add(findRoleByValue(interaction.user.tag)).then( () => {
					interaction.reply({ content: `Added role with color ${hexColor.value} to your name`, ephemeral: true })
					console.log(`Added role with color ${hexColor.value} to ${interaction.user.tag}`)
				})
			}, 1000)

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

			const userRoles = interaction.member.roles.cache.find(role => role.name === interaction.user.tag)
			console.log(userRoles)
	
			if (!userRoles) {
				interaction.reply({content: 'You dont seem to have a role.', ephemeral: true})
				return
			} 
			interaction.member?.roles.remove(userRoles).then( () => {
				interaction.reply({content: 'Removed your color role', ephemeral: true})
				console.log(`Removed color role from ${interaction.user.tag}`)
				roles.remove(userRoles.name)
			 })
		}
	} catch (error) {
		interaction.reply({ content: 'Something went wrong. Either you entered the command wrongly or ask @antifascism wtf happened', ephemeral: true })
		console.log({
			error: error,
			interaction: interaction,
		})
	}

})

client.login(process.env.DISCORD_TOKEN)
function printRoles(){
	const printableRoles = []
	roles.forEach(role => {
		printableRoles.push(role.name)
	})
	console.log(printableRoles)
}
function updateRoles(){
	const newRoles = []
	client.guilds.cache.forEach(guild => {
		guild.roles.cache.forEach(role => {
			newRoles.push(role)
		})
	})

	roles = newRoles
}

function findRoleByValue(value) {
	const role = roles.find(role => role.name === value)
	return role
}