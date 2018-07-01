import test from 'ava';
import 'reflect-metadata';
import * as fs from 'fs';
import * as dayjs from 'dayjs';
import { OfxParser } from '../../src/services/ofxParser';

test('OfxParser can parse an OFX file', t => {
	let parser = new OfxParser();

	let contents = fs.readFileSync('tests/resources/ofxfile1.ofx', { encoding: 'utf8' });

	let result = parser.parse(contents);

	t.truthy(result);

	t.is(result.bankAccountNumber, '12-3456-7890123-00');

	t.is(result.transactions.length, 2);

	t.is(result.transactions[0].amount, -99.99);
	t.true(result.transactions[0].date.isSame(dayjs('2018-03-01')));
	t.is(result.transactions[0].note, 'SOME STORE AUCKLAND ;');  

	t.is(result.transactions[1].amount, 100.12);
	t.true(result.transactions[1].date.isSame(dayjs('2018-03-07')));
	
	t.is(result.transactions[1].note, 'Automatic Payment ABCDEFGHIJKLMN TEST CUTOFF ;Ref: ABCDEFGHIJKLMN TEST CUTOFF');

	//Balance
	t.is(result.transactions[1].balance, 1337.12)
	t.is(result.transactions[0].balance, 1337.12 - 100.12);
});