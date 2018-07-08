import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';

import { OfxParser } from './ofxParser';
import { createDatabase } from './database';
import { createHashHistory } from 'history';

export { Database } from './database';
export * from './ofxParser';
export * from './parseResult';
export { History } from 'history';

export const container = new Container();

export const Services = {
	Database: Symbol(),
	History: Symbol(),
	OfxParser: Symbol(),
}

container.bind(Services.Database).toConstantValue(createDatabase());
container.bind(Services.History).toConstantValue(createHashHistory());
container.bind(Services.OfxParser).to(OfxParser).inSingletonScope();

export const { lazyInject } = getDecorators(container);
