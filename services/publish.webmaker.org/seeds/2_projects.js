'use strict';

exports.seed = function(knex, Promise) {
  return Promise.join(
    knex('projects').insert({
      user_id: 1,
      title: 'spacecats-API',
      tags: 'sinatra, api, REST, server, ruby',
      description: 'Venture a very small stage in a vast cosmic arena Euclid billions upon billions!',
      _date_created: new Date('2015-06-03T13:21:58.000Z'),
      _date_updated: new Date('2015-06-03T13:21:58.000Z')
    }),
    knex('projects').insert({
      user_id: 1,
      title: 'sinatra-contrib',
      tags: 'ruby, sinatra, community, utilities',
      description: 'Hydrogen atoms Sea of Tranquility are creatures of the cosmos shores of the cosmic ocean.',
      _date_created: new Date('2015-06-03T13:21:58.000Z'),
      _date_updated: new Date('2015-06-03T13:21:58.000Z'),
      readonly: true
    }),
    knex('projects').insert({
      user_id: 2,
      title: 'webmaker-android',
      tags: 'android, mobile, social',
      description: 'Gathered by gravity encyclopaedia galactica permanence of ' +
        'the stars made in the interiors of collapsing stars! ',
      _date_created: new Date('2015-06-03T13:21:58.000Z'),
      _date_updated: new Date('2015-06-03T13:21:58.000Z'),
      client: 'webmaker-android'
    }),
    knex('projects').insert({
      user_id: 3,
      title: 'makedrive',
      tags: 'web',
      description: 'Orions sword a still more glorious dawn awaits at the edge ' +
        'of forever consciousness, cosmic fugue Vangelis, globular star cluster.',
      _date_created: new Date('2015-06-03T13:21:58.000Z'),
      _date_updated: new Date('2015-06-03T13:21:58.000Z'),
      readonly: true,
      client: 'makedrive'
    })
  );
};
