import dotenv from 'dotenv'
import winston from 'winston'
dotenv.config()
import { Client, IntentsBitField } from 'discord.js'

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
	),
	transports: [
		new winston.transports.File({ filename: 'error.log', level: 'error' }),
		new winston.transports.File({ filename: 'app.log' }),
	]
	
})

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
	logger.info(`Logged in as ${client.user?.tag}!`) 
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
				logger.info(`User ${interaction.user.tag} already has a color role`)
				return
			}

			if (!findRoleByValue(interaction.user.tag)) {
				logger.info('entered creation')
				await interaction.guild.roles.create({
					name: interaction.user.tag,
					color: hexColor.value,
				}).then(logger.info(`Created role ${interaction.user.tag}`))
				
				updateRoles()
			}
			setTimeout(() => { 
				interaction.member.roles.add(findRoleByValue(interaction.user.tag)).then( () => {
					interaction.reply({ content: `Added role with color ${hexColor.value} to your name`, ephemeral: true })
					logger.info(`Added role with color ${hexColor.value} to ${interaction.user.tag}`)
				})
			}, 1000)

		}
	} catch (error) {
		interaction.reply({ content: 'It seems you entered your slash command wrongly.', ephemeral: true })
		logger.error({
			error: error,
			interaction: interaction,
		})
	}
	
	try {
		if (interaction.commandName === 'delete-color') {

			const userRoles = interaction.member.roles.cache.find(role => role.name === interaction.user.tag)
			logger.info(userRoles)
	
			if (!userRoles) {
				interaction.reply({content: 'You dont seem to have a role.', ephemeral: true})
				return
			}
			interaction.member?.roles.remove(userRoles).then( () => {
				interaction.reply({content: 'Removed your color role', ephemeral: true})
				logger.info(`Removed color role from ${interaction.user.tag}`)
				roles.remove(userRoles.name)
			 })
		}
	} catch (error) {
		interaction.reply({ content: 'Something went wrong. Either you entered the command wrongly or ask @antifascism wtf happened', ephemeral: true })
		logger.error({
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
	logger.info(printableRoles)
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