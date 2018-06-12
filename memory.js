import loki from 'lokijs'
import LokiFsStructuredAdapter from 'node_modules/lokijs/src/loki-fs-structured-adapter.js'
import config from './config'

let db

export const remember = async()=> new Promise( (ok,ko)=> {

	if( db ) return ok( db )

	db = new loki( config.db, {
		autoload: true,
		autoloadCallback : function databaseInitialize() 
		{
			
			// let messages = db.getCollection("messages") || db.addCollection("messages")
			ok( db )
		},
		autosave: true, 
		autosaveInterval: 4000
	})

}) 

const DB = Symbol`DB`
const COLL = Symbol`COLL`
export { DB as longTerm, COLL as model }

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
		.then( db=> this._models.map(m=> m._coll=db.getCollection(model.name.toLowerCase()+'s')) )
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

export class Persistable extends THREE.EventDispatcher {
	constructor( data = {} )
	{
		super()
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