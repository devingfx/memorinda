import { Persistable } from '../memory'

export default class Category extends Persistable {
	static get indices(){ return ['id'] }
	static get disableChangesApi(){ return false }
}