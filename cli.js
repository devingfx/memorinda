import 'colors'
// import * as bot from './bot'
import readline from 'readline'
// import config from './config'
// const { app: { storage } } = config

import { remember, longTerm, model as s, PersistableDB as DB, Persistable } from './memoro'
let db


import { User, Category } from './models'

// let db = new DB( User )
// db.openMind('UFO').then( ET=> console.log(ET) )

// First check if we are already signed in (if credentials are stored). If we
// are logged in, execution continues, otherwise the login process begins.
export default async function main()
{
	// console.log(`${'J A C K B O T'.bold.cyan} v${config.version}`)
	db = await remember( 'MyCRRch2Y5h7d6el56fldk', User, Category )
	// console.log(User)

	makeMenus( User, Category )
	
	// Override / activate change api on this model
	User[s].setChangesApi(true) 
	
	Category[s].insert([
		new Category({ id: 1, name: 'Cat' })
	,	new Category({ id: 2, name: 'Dog' })
	])
	console.log(Category[s].find())
	
	User[s].insert([
		new User({ id: 42, name: 'Totom', category: 1 })
	,	new User({ id: 3, name: 'Doctor', category: 2 })
	])

	
	// // console.log( User[s].findOne({name: 'Toto'}) )
	// console.log( User[s].findOne({name: 'Doctor'}).category.name )

	// if (!(await storage.get('signedin'))) {
	// 	console.log('not signed in')
		
	// 	await bot.login(client, config.phone).catch(console.error)

	// 	console.log('signed in successfully')
	// 	storage.set('signedin', true)
	// } else {
	// 	console.log('already signed in')
	// }
	// spinner()
	
	menu(`
${'Type a command to continue (try help or quit)'.grey}
`).catch(e=>console.error(e))
}

async function menu( intro = '' )
{
	var command = await ask( intro + 'mem> '.green)
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

const js = async()=> ask('> '.yellow)
						.then( resp=> resp == 'exit' ? ''
									: (console.log( eval(resp) ) || js()) )
js.desc = `Evaluate the ecmascript string and show result in stdout.`


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
	spinner( false )
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
exit.desc = `Exits the cli`


const makeMenus = ( ...models )=> models.map( model=> 
	menu[model.name] = (sub, ...parts)=> !sub
											? model[s].find()
										: sub == 'find' 
											? model[s].find( JSON.parse(parts.join(' ')) )
										: sub == 'get' 
											? model[s].findOne( JSON.parse(parts.join(' ')) )
										: sub == 'add' 
											? model[s].insert( JSON.parse(parts.join(' ')) )
										: sub == 'rem'
											? model[s].removeWhere({id:+parts[0]})
										: `No such command ${sub}`
)

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
// const store = async( act, name, value )=> await storage[act]( name, value )
// store.desc = `Save or get a variable in storage: store [get|set] name [value]`



Object.assign( menu, 
	{
		ask,
		spinner,
		// store,
		help,
		exit,
		quit: exit,
		js
		// up: bot.getUpdates
	},
	// bot
)


main().catch( e=>console.error(e) )