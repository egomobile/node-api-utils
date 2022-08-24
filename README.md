[![npm](https://img.shields.io/npm/v/@egomobile/api-utils.svg)](https://www.npmjs.com/package/@egomobile/api-utils)
[![last build](https://img.shields.io/github/workflow/status/egomobile/node-api-utils/Publish)](https://github.com/egomobile/node-api-utils/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-api-utils/pulls)

# @egomobile/api-utils

> REST API extensions for [@egomobile/http-server](https://github.com/egomobile/node-http-server) module, a very fast alternative to [Express.js](http://expressjs.com/)

## Install

Execute the following command from your project folder, where your
`package.json` file is stored:

```bash
npm install --save @egomobile/api-utils
```

## Usage

### Quick examples

#### Build API responses

```typescript
import createServer, { query, params } from "@egomobile/http-server";
import { apiResponse, parseListQuery } from "@egomobile/api-utils";

const app = createServer();

app.get("/users", [query(), parseListQuery()], async (request, response) => {
  // load all users into 'allUsers'

  // use request.listQuery, created by middleware of parseListQuery(),
  // to select items inside data source of 'allUsers'
  // and save it to 'selectedUsers'

  apiResponse(request, response)
    .withList({
      limit: request.listQuery!.limit,
      offset: request.listQuery!.offset,
      totalCount: allUsers.length,

      items: selectedUsers,
    }) // set list for 'data' prop
    .send(); // write all data to client
});

app.get(params("/users/:id"), async (request, response) => {
  // load user with :id into 'user'

  apiResponse(request, response)
    .withData(user) // set value for 'data' prop
    .addMessage({
      type: "info",
      message: "foo",
    }) // an info message for the user
    .addMessage({
      type: "warn",
      message: "bar",
      internal: true,
    }) // a warning message for internal usage
    .send(); // write all data to client
});

app.listen().catch(console.error);
```

#### Error handling

```typescript
import createServer, { json } from "@egomobile/http-server";
import {
  handleApiError,
  handleApiNotFound,
  handleApiParseError,
} from "@egomobile/api-utils";

const app = createServer();

// set error handlers
app.setErrorHandler(handleApiError());
app.setNotFoundHandler(handleApiNotFound());

app.post(
  "/",
  // handle parsing errors for JSON data
  [json({ onParsingFailed: handleApiParseError() })],
  async (request, response) => {
    response.write("OK: " + JSON.stringify(request.body!));
  }
);

// ...

app.listen().catch(console.error);
```

#### Swagger documentation

```typescript
import createServer, {
  ControllersSwaggerBaseDocument,
} from "@egomobile/http-server";
import { loadSwaggerDocumentationSync } from "@egomobile/api-utils";

const app = createServer();

app.controllers({
  rootDir: __dirname + "/controllers",

  // loads a Swagger base document, with all components
  // from `swagger` subfolder
  //
  // the folder must have the following structure:
  //
  // .
  // ├── swagger
  // │   ├── index.ts (must export the base document => https://egomobile.github.io/node-http-server/types/ControllersSwaggerBaseDocument.html)
  // |   |
  // │   ├── components (contains components => https://swagger.io/specification/#components-object)
  // |   |   ├── callbacks (optional)
  // |   |   |   ├── FooCallback.ts (exports a callback with the name `FooCallback` => https://swagger.io/specification/#callback-object)
  // |   |   ├── examples (optional)
  // |   |   |   ├── FooExample.ts (exports an example with the name `FooExample` => https://swagger.io/specification/#example-object)
  // |   |   ├── headers (optional)
  // |   |   |   ├── FooHeader.ts (exports a header with the name `FooHeader` => https://swagger.io/specification/#header-object)
  // |   |   ├── links (optional)
  // |   |   |   ├── FooLink.ts (exports a link with the name `FooLink` => https://swagger.io/specification/#link-object)
  // |   |   ├── parameters (optional)
  // |   |   |   ├── FooParameter.ts (exports a parameter with the name `FooParameter` => https://swagger.io/specification/#parameter-object)
  // |   |   ├── requestBodies (optional)
  // |   |   |   ├── FooRequest.ts (exports a request body with the name `FooRequest` => https://swagger.io/specification/#request-body-object)
  // |   |   ├── responses (optional)
  // |   |   |   ├── FooResponse.ts (exports a response with the name `FooResponse` => https://swagger.io/specification/#response-object)
  // |   |   ├── schemas (optional)
  // |   |   |   ├── FooSchema.ts (exports a scheme with the name `FooSchema` => https://swagger.io/specification/#schema-object)
  // |   |   ├── securitySchemes (optional)
  // |   |   |   ├── FooSecuritySchema.ts (exports a security scheme with the name `FooSecuritySchema` => https://swagger.io/specification/#security-scheme-object)
  //
  swagger: loadSwaggerDocumentationSync({
    dir: __dirname + "/swagger",
    ext: ".ts", // include TypeScript files
  }),
});

app.listen().catch(console.error);
```

Example for an exported object (`/swagger/components/responses/FooResponse.ts`):

```typescript
import type { OpenAPIV3 } from "@egomobile/http-server";

const FooResponse: OpenAPIV3.ResponseObject = {
  description: "A foo response.",
  content: {
    "application/json": {
      examples: {
        "Example #1": {
          value: {
            success: false,
            data: null,
            messages: [
              {
                code: 40300,
                id: "03dcbaa4ef879ece0a0d09eeb5d00e6c",
                internal: true,
                message: "Forbidden access",
                type: "error",
              },
            ],
          },
        },
      },
    },
  },
};

export default FooResponse;
```

The object can be referenced by

```json
{
  "$ref": "#/components/responses/FooResponse"
}
```

## Credits

The module makes use of:

- [joi](https://joi.dev/) by [Sideway Inc.](https://github.com/sideway)

## Documentation

The API documentation can be found
[here](https://egomobile.github.io/node-api-utils/).
