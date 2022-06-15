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

### Quick example

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

## Credits

The module makes use of:

- [joi](https://joi.dev/) by [Sideway Inc.](https://github.com/sideway)

## Documentation

The API documentation can be found
[here](https://egomobile.github.io/node-api-utils/).
