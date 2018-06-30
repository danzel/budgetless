import { ParseResult, ParseTransaction } from "./parseResult";
import * as xml2js from 'xml2js';
import * as dayjs from "dayjs";

export class OfxParser {
	parse(fileContents: string): ParseResult {

		let lines = fileContents.replace(/\r/g, '').split('\n');
		//Skip the header, we don't do anything with it yet
		let start = lines.indexOf('<OFX>');

		//Fix up the XML on lines that need it
		for (var i = start; i < lines.length; i++) {
			let line = lines[i];

			//Lines that should have closing tags
			if (line[line.length - 1] != '>') {
				let tagEnd = line.lastIndexOf('>')

				lines[i] = line + '</' + line.substring(1, tagEnd + 1);
			}
		}


		fileContents = lines.slice(start).join('\n')

		let error;
		let result: any;
		xml2js.parseString(fileContents, (pErr, pResult) => { error = pErr, result = pResult });
		if (error || !result) {
			throw new Error("Failed to parse OFX as XML: " + error);
		}

		let bankAccountNumber;
		try {
			bankAccountNumber = result.OFX.BANKMSGSRSV1[0].STMTTRNRS[0].STMTRS[0].BANKACCTFROM[0].ACCTID[0];
		} catch (err) {
			throw new Error("Failed to find bank account number: " + err);
		}

		let transactions = new Array<ParseTransaction>();
		try {
			let ofxTrans: Array<any> = result.OFX.BANKMSGSRSV1[0].STMTTRNRS[0].STMTRS[0].BANKTRANLIST[0].STMTTRN;

			ofxTrans.forEach(t => {
				transactions.push({
					amount: parseFloat(t.TRNAMT[0]),
					date: this.parseDate(t.DTPOSTED[0]),
					note: t.MEMO[0]
				})
			})
		} catch (err) {
			throw new Error("Failed to parse transactions: " + err);
		}

		//Get final balance
		let balance;
		try {
			balance = parseFloat(result.OFX.BANKMSGSRSV1[0].STMTTRNRS[0].STMTRS[0].LEDGERBAL[0].BALAMT[0]);
		} catch (err) {
			throw new Error("Failed to find final balance: " + err);
		}

		//Back-calculate balance
		for (let i = transactions.length - 1; i >= 0; i--){
			let t = transactions[i];
			t.balance = balance;
			balance -= t.amount;
		}

		return {
			bankAccountNumber,
			transactions
		};
	}

	private parseDate(date: string): dayjs.Dayjs {
		return dayjs(date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2))
	}
}