exports.seed = function(knex, Promise) {
  return Promise.join(
    knex('publishedProjects').insert({
      title: 'sinatra-contrib',
      tags: 'ruby, sinatra, community, utilities',
      description: 'Hydrogen atoms Sea of Tranquility are creatures of the cosmos shores of the cosmic ocean.',
      _date_created: new Date('2015-06-19T17:21:58.000Z'),
      _date_updated: new Date('2015-06-23T06:41:58.000Z')
    }),
    knex('publishedProjects').insert({
      title: 'spacecats-API',
      tags: 'sinatra, api, REST, server, ruby',
      description: 'Venture a very small stage in a vast cosmic arena Euclid billions upon billions!'
    })
  ).then(function() {
    return Promise.join(
      knex('projects').where('id', 2)
      .update({
        published_id: 1
      }),
      knex('projects').where('id', 1)
      .update({
        published_id: 2
      })
    );
  });
};
