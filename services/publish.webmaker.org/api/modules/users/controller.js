"use strict";

const Boom = require(`boom`);

const UsersModel = require(`./model`);
const Errors = require(`../../classes/errors`);

const BaseController = require(`../../classes/base_controller`);

class UsersController extends BaseController {
  constructor() {
    super(UsersModel);
  }

  formatRequestData(request) {
    const data = { name: request.payload.name };

    if (request.params.id) {
      data.id = parseInt(request.params.id);
    }

    return data;
  }

  login(request, reply) {
    if (request.payload.name !== request.auth.credentials.username) {
      return reply(
        Errors.generateErrorResponse(
          Boom.unauthorized(null, {
            debug: true,
            error: `Authenticated user doesn't match the user requested`
          })
        )
      );
    }

    const result = this.Model.query({
      where: {
        name: request.payload.name
      }
    })
    .fetch()
    .then(usersModel => {
      if (!usersModel) {
        return this.Model
        .forge({ name: request.payload.name })
        .save()
        .then(function(newUsersModel) {
          return request.generateResponse(newUsersModel.toJSON())
          .code(201);
        });
      }

      return request.generateResponse(usersModel.toJSON())
      .code(200);
    })
    .catch(Errors.generateErrorResponse);

    reply(result);
  }
}

module.exports = new UsersController();
