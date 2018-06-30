import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';

import { OfxParser } from './ofxParser';
import { createDatabase } from './database';

export * from './ofxParser';
export * from './parseResult';

let container = new Container();

export const Services = {
	Database: Symbol(),
	OfxParser: Symbol(),
}

container.bind(Services.Database).toConstantValue(createDatabase());
container.bind(Services.OfxParser).to(OfxParser).inSingletonScope();

export const { lazyInject } = getDecorators(container);

if (module && module.hot) {
	module.hot.decline();
}