# ytnobody-hono-on-azure-functions-prototype

Prototype of Hono Adapter for Azure Functions v4

## Boot up on your local machine with devcontainer

First, you need to install [Docker Desktop](https://www.docker.com/products/docker-desktop) and [VSCode](https://code.visualstudio.com/).

Then, you can boot up this project with [VSCode Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

```
### install deps
$ pnpm install

### build with tsc
$ pnpm prestart

### run functions v4 locally
$ pnpm start
```
