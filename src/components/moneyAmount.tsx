import * as React from 'react';
import * as commaNumber from 'comma-number';

export class MoneyAmount extends React.PureComponent<{ amount: number }> {
	render() {
		const amount = this.props.amount;
		let className = amount >= 0 ? 'income' : 'expense';
		let amountStr = commaNumber(Math.abs(amount).toFixed(2));
		if (amount > 0) {
			amountStr = '+ ' + amountStr;
		} else {
			amountStr = '- ' + amountStr;
		}

		return <span className={className}>{amountStr}</span>
	}
}