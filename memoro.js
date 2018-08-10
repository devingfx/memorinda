import loki from 'lokijs'
import LokiFsStructuredAdapter from './node_modules/lokijs/src/loki-fs-structured-adapter.js'
// import config from './config'

// SAVE : will save database in 'test.crypted'
import LokiCryptedFileAdapter from './loki-kripta-dosiero-adaptilo'
// lokiCryptedFileAdapter.setSecret('mySecret') // you should change 'mySecret' to something supplied by the user

// var db = new loki('test.crypted',{ adapter: lokiCryptedFileAdapter }); //you can use any name, not just '*.crypted'

const DB = Symbol`DB`
const COLL = Symbol`COLL`
export { DB as longTerm, COLL as model }

let db

const toSubjects = name=> name.toLowerCase() + 's'
const isFunc = obj=> typeof obj == 'function'

export default async (...cmd)=> console.log(cmd)

export const remember = async ( subject = 'mem', ...models )=> new Promise( (ok,ko)=>
		
		db = new loki( `${subject}.db`, Object.assign({ 
				// adapter: new LokiFsStructuredAdapter(),
				adapter: new LokiCryptedFileAdapter('mySecret'),
				autoload: true,
				autoloadCallback : ()=> ok( db ),
				autosave: true, 
				autosaveInterval: 4000
			},
			models.filter( isFunc )
				.reduce( (opt,model)=> {
					opt[toSubjects(model.name)] = { proto: model }
					return opt
				},{}) 
		))
	)
	.then( db=> (models.filter( isFunc ).map( model=> {
		
		model[COLL] = db.getCollection( toSubjects(model.name) )
						|| db.addCollection( toSubjects(model.name), {
							indices: model.indices,
							unique: model.unique
						})
		model[COLL].objType = model
		model[COLL][DB] = model[DB] = db
		model[COLL].upsert = upsert

	}), db) )



function upsert( data )
{
	// let obj, toUpdate = collection.findObject( data )
	const collection = this
	let obj
	,	toUpdate = data && this.findObject(
			Object.keys( this.binaryIndices )
				.reduce( (ex,key)=> (ex[key]=data[key],ex), {}  )
		)
	// if( toUpdate )
	// {
	// 	Object.assign( toUpdate, data )
	// 	// obj.$loki = toUpdate[0].$loki
	// 	// obj.meta = toUpdate[0].meta
	// 	// toUpdate._DB = this
	// 	collection.update( toUpdate )
	// }
	// else {
	// 	// obj = 
	// 	// obj._DB = this
	// 	collection.insert( data instanceof this.objType ? data : new this.objType( data ) )
	// }
	
	return toUpdate
			? this.update( Object.assign(toUpdate, data) )
			: this.insert( data instanceof this.objType ? data : new this.objType(data) )

	
	// TODO replace by change API
	// let type = (obj || toUpdate).constructor.name.toLowerCase()
	// this.dispatchEvent({
	// 	type:  type + (toUpdate ? 'Updated' : 'Added')	// peerAdded accountAdded ...
	// ,	[type]: obj || toUpdate 						// e.peer e.account ....
	// })
	
	return obj || toUpdate
}


export class PersistableDB /*extends THREE.EventDispatcher*/ {
	constructor( ...models )
	{
		// Object.assign( this, EventTarget.prototype );
		// super()
		this._models = []
		models.map( model=> this.addModel(model) )
	}
	
	addModel( model )
	{
		model.DB = this
		this._models.push( model )
	}
	
	openMind( name, persistance = true )
	{
		// var idbAdapter = new LokiIndexedAdapter('WOoT');
		// if( idbAdapter.checkAvailability() )
		// 	// use paging only if you expect a single collection to be over 50 megs or so
		// 	var pa = new loki.LokiPartitioningAdapter(idbAdapter, { paging: true });
		// else
		// 	var pa = new loki.LokiPartitioningAdapter(new loki.LokiMemoryAdapter(), { paging: true });
		
		return new Promise( (ok,ko)=>
			this.db = new loki( `${name}.db`, Object.assign({ 
				adapter: new LokiFsStructuredAdapter(),
				autoload: true,
				autoloadCallback : ()=> { ok( this.db ); this.onMindOpen() },
				autosave: true, 
				autosaveInterval: 4000
			}, this._models.reduce( (opt,model)=> {
					opt[model.name.toLowerCase()+'s'] = { proto: model }
					return opt
				},{}) )
				// peers: { proto: this._peerClass },
				// accounts: { proto: this._accountClass },
				// transactions: { proto: this._transactionClass },
			)
		)
		.then( db=> this._models.map(model=> model._coll = db.getCollection(model.name.toLowerCase()+'s')) )
	}
	
	onMindOpen()
	{
		this._models.map( model=> {
			let col = model.name.toLowerCase()+'s'
			this[col] = this.db.getCollection( col )
						|| this.db.addCollection( col, {indices: model.indices, unique: model.unique} )
		
			// this[col].data.map( item=> item._DB = this )
		})
	}
	
	updateOrInsert( collection, data )
	{
		// let obj, toUpdate = collection.findObject( data )
		let obj
		,	toUpdate = data && collection.findObject(
				Object.keys( collection.binaryIndices )
					.reduce( (ex,key)=> (ex[key]=data[key],ex), {}  )
			)
		if( toUpdate )
		{
			Object.assign( toUpdate, data )
			// obj.$loki = toUpdate[0].$loki
			// obj.meta = toUpdate[0].meta
			// toUpdate._DB = this
			collection.update( toUpdate )
		}
		else {
			obj = new this.db.options[collection.name].proto( data )
			// obj._DB = this
			collection.insert( obj )
		}
		
		let type = (obj || toUpdate).constructor.name.toLowerCase()
		
		// TODO replace by change API
		// this.dispatchEvent({
		// 	type:  type + (toUpdate ? 'Updated' : 'Added')	// peerAdded accountAdded ...
		// ,	[type]: obj || toUpdate 						// e.peer e.account ....
		// })
		
		return obj || toUpdate
	}
}

/**
 * Exemple PersistableDB class
 * /
class Blockchain extends PersistableDB {
	constructor( url )
	{
		super( Peer, Block, Account, Certification, Transaction )
		this.url = url
		fetcher( `${url}blockchain/parameters` )
			.then( params=> this.parameters = params )
			.then( params=> this.openDatabase(params.currency) )
			
		// debugger;
	}
}
/**/


/**
 * Persistable class
 */

export class Persistable {
	constructor( data = {} )
	{
		// super()
		Object.assign( this, data )
	}
	get _DB(){ return this.constructor.DB }
	get [DB](){ return this.constructor[DB] }
	get [COLL](){ return this.constructor[COLL] }
	toJSON()
	{
		const descs = Object.getOwnPropertyDescriptors(this.constructor.prototype)
		return Object.keys(descs)
					.filter( key=> descs[key].set )
					.map( key=> '_'+key )
					.concat( Object.keys( this ) 
								.filter( key=> key[0] != '_' )
					)
					.reduce( (res,key)=> (res[key] = this[key], res), {} )
	}

	update()
	{
		this[COLL].update( this )
	}
}


/**
 * Exemple Persistable class
 * /

class Peer extends Persistable {
	
	static get indices(){ return ['pubkey','currency'] }
	static get unique(){ return ['pubkey'] }

	constructor( options = {} )
	{
		super( options )
		
	}
	
	
}
/**/