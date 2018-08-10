import { Persistable, model as s } from '../memoro'
import Category from './Category'

export default class User extends Persistable {
	static get indices(){ return ['id'] }
	static get unique(){ return ['id'] }
	
	set category(v){ this._category = v instanceof Category ? v.id : v }
	get category(){ return Category[s].findOne({$loki:this._category}) }
}