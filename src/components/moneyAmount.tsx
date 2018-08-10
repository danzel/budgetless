import * as React from 'react';
import * as commaNumber from 'comma-number';

export class MoneyAmount extends React.PureComponent<{ amount: number, hideDecimals?: boolean }> {
	render() {
		const amount = this.props.amount;
		let className = amount >= 0 ? 'income' : 'expense';
		let amountStr = commaNumber(Math.abs(amount).toFixed(this.props.hideDecimals ? 0 : 2));
		if (amount > 0) {
			amountStr = '+ ' + amountStr;
		} else if (amount < 0) {
			amountStr = '- ' + amountStr;
		}

		return <span className={className}>{amountStr}</span>
	}
}