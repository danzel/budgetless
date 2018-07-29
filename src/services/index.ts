import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import 'reflect-metadata';

import { OfxParser } from './ofxParser';
import { createDatabase } from './database';
import { createHashHistory } from 'history';
import { ToasterInstance } from './toaster';
import { Services } from './serviceEnum';

export { Database } from './database';
export * from './ofxParser';
export * from './parseResult';
export * from './importHelper';
export { History } from 'history';
export * from './serviceEnum';

export const container = new Container();


container.bind(Services.Database).toConstantValue(createDatabase());
container.bind(Services.History).toConstantValue(createHashHistory());
container.bind(Services.OfxParser).to(OfxParser).inSingletonScope();
container.bind(Services.Toaster).toConstantValue(ToasterInstance);

export const { lazyInject } = getDecorators(container);
