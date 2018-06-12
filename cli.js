import 'colors'
// import * as bot from './bot'
import readline from 'readline'
// import config from './config'
// const { app: { storage } } = config

import { remember, PersistableDB } from './memory'

let db = new PersistableDB()
// First check if we are already signed in (if credentials are stored). If we
// are logged in, execution continues, otherwise the login process begins.
export default async function main()
{
	// console.log(`${'J A C K B O T'.bold.cyan} v${config.version}`)
	
	// if (!(await storage.get('signedin'))) {
	// 	console.log('not signed in')
		
	// 	await bot.login(client, config.phone).catch(console.error)

	// 	console.log('signed in successfully')
	// 	storage.set('signedin', true)
	// } else {
	// 	console.log('already signed in')
	// }
	// spinner()
	
// 	menu(`
// ${'Type a command to continue (try help or quit)'.grey}
// `).catch(e=>console.error(e))
}

async function menu( intro = '' )
{
	var command = await ask( intro + 'bot> '.green)
	spinner()
	let args = command.split(' ')
	command = args.shift()
	if( !menu[command] )
	{
		console.log(`No such command: ${command}`)
		return menu()
	}
	try{
		console.log( await menu[command]( ...args ) || '' )
		// console.log('ok', command, args)
	}catch(e){ console.error(e) }
	spinner( false )
	menu()
}

var interval;
function spinner( on = true ) {
    if( interval || !on ) {
        clearInterval(interval)
        process.stdout.write(' \b')
        // rl.resume()
        return
    }
    var chars = ['\\', '|', '/', '-']
    var i = 0
    interval = setInterval(function () {
        process.stdout.write(chars[i++ % 4])
        process.stdout.write('\b')
    }, 200)
    // rl.pause()
}

const ask = question => new Promise((resolve) => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	rl.question( question, o=> {
		rl.close()
		resolve(o)
	})
})

async function help()
{
	Object.keys( menu ).map( m=> console.log( `\t${m}\t\t${menu[m].desc}` ) )
}
help.desc = `Show available commands`

async function exit()
{
	console.log( `Bye bye !` )
	process.exit()
}
exit.desc = `Exits the bot`

// async function save( name, value )
// {
// 	storage.set( name, value )
// }
// save.desc = `Save a variable in storage: save name value`

// async function store( act, name, value )
// {
// 	return await storage[act]( name, value )
// 	//   act == 'set' ? storage.set( name, value )
// 	// : act == 'get' ? await storage.get( name )
// 	// : ''
// }
const store = async( act, name, value )=> await storage[act]( name, value )
store.desc = `Save or get a variable in storage: store [get|set] name [value]`



Object.assign( menu, 
	{
		ask,
		spinner,
		store,
		help,
		exit,
		quit: exit,
		up: bot.getUpdates
	},
	bot
)


main().catch( e=>console.error(e) )