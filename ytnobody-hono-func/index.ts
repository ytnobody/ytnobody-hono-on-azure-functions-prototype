import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { App } from "./honoapp";
import { handle } from "./hono-azure-functions-adapter/adapter";

const app = App.init();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context = await handle(app)({ context, req });
};

export default httpTrigger;