export default
{
    main: {
        waitBeforeExitSeconds: 25
    },
    server: {
        port: 8080,
        session: {
            secret: ['cribbage-75849827','cribbage-99210593','cribbage-25911064'],
            name: 'cribbage',
            path: '/',
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'Strict',

            },
            maxAgeDays: 7
        },
        sessionStore: {
            checkPeriod: 86400000,
            noDisposeOnSet: true
        }
    },
    database: {
        user: 'cribbage',
        host: 'db-dev-postgres-scratchpad.cttif5ymouyr.us-east-1.rds.amazonaws.com',
        database: 'cribbage',
        password: 'CribbageRootUser69!',
        port: 5432,
        max: 15,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
    },
    crypto: {
        iters: 100000,
        keylen: 128,
        alg: 'sha256',
        saltlen: 16
    },
    logFilePath: './logs/all.log',
    logLevelDefault: 'debug',
    logLevels: {
        main: 'debug',
        dataabase: 'debug',
        UserEntity: 'debug',
        DeckHand: 'info',
        Pegging: 'info',
        AuthMiddleware: 'debug',
        User: 'debug',
        APIRoutes: 'debug',
        Login: 'debug',
        UserRoutes: 'debug',
        UserServer: 'debug',
        SessionManager: 'debug',
    },
    api: {
        jsDocOptions: {
            failOnErrors: true,
            definition: {
                "openapi": "3.0.0",
                "info": {
                    "title": "Cribbage",
                    "description": "API for cribbage application",
                    "termsOfService": "http://example.com/terms/",
                    "contact": {
                      "name": "API Support",
                      "url": "http://www.example.com/support",
                      "email": "support@example.com"
                    },
                    "license": {
                      "name": "Apache 2.0",
                      "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
                    },
                    "version": "1.0.0"
                },
                "servers": [
                    { url: "http://localhost:8080/", },
                ],
                "components": {
                    "schemas": {
                        "GeneralError": {
                            "type": "object",
                            "properties": {
                                "code": { "type": "integer", "format": "int32" },
                                "message": { "type": "string" }
                            }
                        },
                        "Message": {
                            "type": "object",
                            "properties": {
                                "message": { "type": "string" }
                            }
                        },
                        "NewUserRequest": {
                            "required": [
                                "email", "firstName", "lastName", "password", "passwordRepeat"
                            ],
                            "properties": {
                                "email":            { "type": "string" },
                                "firstName":        { "type": "string" },
                                "lastName":         { "type": "string" },
                                "password":         { "type": "string" },
                                "passwordRepeat":   { "type": "string" }
                            }
                        },
                        "User": {
                            "type": "object",
                            "properties": {
                                "id":           { "type": "integer", "format": "int64" },
                                "email":        { "type": "string" },
                                "firstName":    { "type": "string" },
                                "lastName":     { "type": "string" }
                            }
                        },
                    },
                    "parameters": {
                        "userIdParam": { "name": "userId", "required": true, "in": "path",
                            "description": "User id",
                            "schema": { "type": "integer", "format": "int64" }
                        },
                        "skipParam": { "name": "skip", "required": true, "in": "query",
                            "description": "Number of items to skip",
                            "schema": { "type": "integer", "format": "int32" }
                        },
                        "limitParam": {
                            "name": "limit", "required": true, "in": "query",
                            "description": "Max records to return",
                            "schema" : { "type": "integer", "format": "int32" }
                        }
                    },
                    "requestBodies": {
                        "NewUserReqBody": {
                            "description": "New user request",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/NewUserRequest"
                                    }
                                }
                            }

                        }
                    },
                    "responses": {
                        "OK": {
                            "description": "OK"
                        },
                        "UserList": {
                            "description": "A list of users",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "$ref": "#/components/schemas/User"
                                        }
                                    }
                                }
                            }
                        },
                        "User": {
                            "description": "A user",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User"
                                    }
                                }
                            }

                        },
                        "UserExists": {
                            "description": "User exists",
                            "content": {
                                "application/json": { "schema": { "$ref": "#/components/schemas/Message" } }
                            }
                        },
                        "NewUserCreated": {
                            "description": "New user created",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User"
                                    }
                                }
                            }
                        },
                        "NotLoggedIn": {
                            "description": "User is not logged in",
                            "content": {
                                "application/json": { "schema": { "$ref": "#/components/schemas/Message" } }
                            }
                        },
                        "Unauthorized": {
                            "description": "Unauthorized access"
                        },
                        "NotFound": {
                            "description": "Entity not found"
                        },
                        "IllegalInput": {
                            "description": "Illegal input for operation"
                        },
                        "GeneralError": {
                            "description": "General error",
                            "content": {
                                "application/json": { "schema": { "$ref": "#/components/schemas/GeneralError" } }
                            }
                        },
                        "BadRequest": {
                            "description": "Bad request",
                            "content": {
                                "application/json": { "schema": { "$ref": "#/components/schemas/Message" } }
                            }
                        }
                    },
                    "securitySchemes": {
                      "api_key": { "type": "apiKey", "name": "api_key", "in": "header" }
                    }
                  }
            },
            apis: [
                "./src/routes/*Routes.js"
            ]
        }
    }
}