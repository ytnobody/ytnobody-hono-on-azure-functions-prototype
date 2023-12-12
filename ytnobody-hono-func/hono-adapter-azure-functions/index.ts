import { Context } from './Context';
export { Context } from './Context';
export { HttpRequest } from './http';
export { handle } from './handler';
export type AzureFunction = (context: Context, ...args: any[]) => Promise<any> | void;
