import test from 'ava';

import { ImportHelper } from "../../src/services/importHelper";
import { withDatabase } from '../helper';

test('ImportHelper can find a dupe', async t => withDatabase(async database => {
	let importHelper = new ImportHelper(database);

	console.log(await (await database).bankAccounts.count());

	//TODO...
	//importHelper.dupeCheck(...)

	t.true(true);
}));