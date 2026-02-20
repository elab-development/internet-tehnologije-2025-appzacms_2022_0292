def swagger_template():
    return {
        "swagger": "2.0",
        "info": {
            "title": "CMS Platform API",
            "description": (
                "Swagger dokumentacija za Flask API (auth, admin, sites, templates, pages, posts, health). "
                "Autentifikacija je preko Flask-Login session cookie."
            ),
            "version": "1.0.0",
        },
        "basePath": "/",
        "schemes": ["http"],
        "consumes": ["application/json"],
        "produces": ["application/json"],

        "securityDefinitions": {
            "cookieAuth": {
                "type": "apiKey",
                "in": "cookie",
                "name": "session",
                "description": "Flask-Login session cookie",
            }
        },

        "definitions": {
            "Error": {
                "type": "object",
                "properties": {"error": {"type": "string"}},
            },

            "UserPublic": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "role": {"type": "string", "enum": ["user", "admin"]},
                    "createdAt": {"type": ["string", "null"], "format": "date-time"},
                    "updatedAt": {"type": ["string", "null"], "format": "date-time"},
                },
            },

            "AuthResponse": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "user": {"$ref": "#/definitions/UserPublic"},
                },
            },

            "MeResponse": {
                "type": "object",
                "properties": {
                    "user": {
                        "type": ["object", "null"],
                        "allOf": [{"$ref": "#/definitions/UserPublic"}],
                    }
                },
            },

            "Site": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "slug": {"type": "string"},
                    "createdById": {"type": "integer"},
                    "config": {"type": ["object", "null"]},
                    "createdAt": {"type": ["string", "null"], "format": "date-time"},
                    "updatedAt": {"type": ["string", "null"], "format": "date-time"},
                },
            },
            "SitesListResponse": {
                "type": "object",
                "properties": {
                    "sites": {"type": "array", "items": {"$ref": "#/definitions/Site"}},
                },
            },

            "Template": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "type": {"type": "string", "enum": ["page", "post", "both"]},
                    "config": {"type": ["object", "null"]},
                    "createdById": {"type": "integer"},
                    "createdAt": {"type": ["string", "null"], "format": "date-time"},
                    "updatedAt": {"type": ["string", "null"], "format": "date-time"},
                },
            },
            "TemplatesListResponse": {
                "type": "object",
                "properties": {
                    "templates": {"type": "array", "items": {"$ref": "#/definitions/Template"}},
                },
            },

            "BlockTree": {
                "type": "object",
                "properties": {
                    "version": {"type": "integer", "example": 1},
                    "blocks": {
                        "type": "array",
                        "items": {"type": "object"},
                        "example": [],
                    },
                },
            },

            "Page": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "siteId": {"type": "integer"},
                    "templateId": {"type": ["integer", "null"]},
                    "title": {"type": "string"},
                    "slug": {"type": "string"},
                    "content": {"$ref": "#/definitions/BlockTree"},
                    "status": {"type": "string", "enum": ["draft", "published"]},
                    "createdById": {"type": "integer"},
                    "createdAt": {"type": ["string", "null"], "format": "date-time"},
                    "updatedAt": {"type": ["string", "null"], "format": "date-time"},
                },
            },
            "PagesListResponse": {
                "type": "object",
                "properties": {
                    "pages": {"type": "array", "items": {"$ref": "#/definitions/Page"}},
                },
            },

            "Post": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "siteId": {"type": "integer"},
                    "templateId": {"type": ["integer", "null"]},
                    "authorId": {"type": "integer"},
                    "title": {"type": "string"},
                    "slug": {"type": "string"},
                    "content": {"$ref": "#/definitions/BlockTree"},
                    "status": {"type": "string", "enum": ["draft", "published"]},
                    "createdAt": {"type": ["string", "null"], "format": "date-time"},
                    "updatedAt": {"type": ["string", "null"], "format": "date-time"},
                },
            },
            "PostsListResponse": {
                "type": "object",
                "properties": {
                    "posts": {"type": "array", "items": {"$ref": "#/definitions/Post"}},
                },
            },

            "AdminOverviewResponse": {
                "type": "object",
                "properties": {
                    "totals": {
                        "type": "object",
                        "properties": {
                            "users": {"type": "integer"},
                            "sites": {"type": "integer"},
                            "pages": {"type": "integer"},
                            "posts": {"type": "integer"},
                        },
                    },
                    "usersByRole": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "role": {"type": "string", "enum": ["admin", "user"]},
                                "count": {"type": "integer"},
                            },
                        },
                    },
                    "pagesByStatus": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "status": {"type": "string", "enum": ["draft", "published"]},
                                "count": {"type": "integer"},
                            },
                        },
                    },
                    "postsByStatus": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "status": {"type": "string", "enum": ["draft", "published"]},
                                "count": {"type": "integer"},
                            },
                        },
                    },
                    "topSites": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "siteId": {"type": "integer"},
                                "name": {"type": "string"},
                                "slug": {"type": "string"},
                                "pagesCount": {"type": "integer"},
                                "postsCount": {"type": "integer"},
                                "total": {"type": "integer"},
                            },
                        },
                    },
                },
            },

            "HealthResponse": {
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "service": {"type": "string"},
                },
            },
            "HealthDbResponse": {
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "service": {"type": "string"},
                    "result": {"type": ["integer", "null"]},
                    "message": {"type": ["string", "null"]},
                },
            },
        },

        "tags": [
            {"name": "Auth", "description": "Register / login / logout / me"},
            {"name": "Admin", "description": "Admin dashboard endpoints (users + overview)"},
            {"name": "Sites", "description": "Sites CRUD"},
            {"name": "Templates", "description": "Templates CRUD"},
            {"name": "Pages", "description": "Pages CRUD"},
            {"name": "Posts", "description": "Posts CRUD"},
            {"name": "Health", "description": "Health endpoints"},
        ],
    }