# Change Log (@egomobile/api-utils)

## 1.1.0

- implement `handleApiParseError()`, which creates standardrized error handlers for invalid JSON, e.g.

## 1.0.0

- fix [parseListQuery()](https://egomobile.github.io/node-api-utils/modules.html#parseListQuery)
- apply new [eslint-config-ego](https://github.com/egomobile/eslint-config-ego) settings
- module requires at least:
  - [Node 14+](https://nodejs.org/gl/blog/release/v14.0.0/)
  - [node-http-server 0.34.0+](https://github.com/egomobile/node-http-server)
- code and other project cleanups

## 0.6.1

- add following props and methods to [ApiResponseBuilder](https://egomobile.github.io/node-api-utils/classes/ApiResponseBuilder.html):
  - `data`
  - `headers`
  - `messages`
  - `status`
  - `success`
  - `withSuccess()`
- add `executeEnd` setting to [IApiResponseBuilderOptions](https://egomobile.github.io/node-api-utils/interfaces/IApiResponseBuilderOptions.html)
- add `options` argument to [apiResponse()](https://egomobile.github.io/node-api-utils/modules.html#apiResponse)

## 0.5.0

- add [createSwaggerSchemaForApiListResponse()](https://egomobile.github.io/node-api-utils/modules.html#createSwaggerSchemaForApiListResponse) function
- add [withHeaders()](https://egomobile.github.io/node-api-utils/classes/ApiResponseBuilder.html#withHeaders) method
- (bug-)fixes

## 0.4.0

- add [createSwaggerSchemaForApiResponse()](https://egomobile.github.io/node-api-utils/modules.html#createSwaggerSchemaForApiResponse) function

## 0.3.0

- add [extendRequest()](https://egomobile.github.io/node-api-utils/modules.html#extendRequest) middleware
- add [handleApiValidationError()](https://egomobile.github.io/node-api-utils/modules.html#handleApiValidationError)
- fix [ApiResponseData](https://egomobile.github.io/node-api-utils/modules.html#ApiResponseData)
- set `sourceMap` to `(false)`
- other (bug-)fixes

## 0.2.1

- add [parseListQuery](https://egomobile.github.io/node-api-utils/modules.html#parseListQuery), which creates middlewares to parse and validate query params, which can be used to realize list / collection cursors

## 0.1.1

- initial release
