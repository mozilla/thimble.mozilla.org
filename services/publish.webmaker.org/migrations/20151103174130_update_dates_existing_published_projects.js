'use strict';

exports.up = function (knex, Promise) {
  return knex('publishedProjects')
  .whereNull('date_created')
  .orWhereNull('date_updated')
  .select('id', 'date_created', 'date_updated')
  .then(function(publishedProjects) {
    if (!publishedProjects) {
      return;
    }

    return Promise.map(publishedProjects, function(publishedProject) {
      var publishedProjectId = publishedProject.id;
      var dateUpdated = publishedProject.date_updated;

      // For existing published projects that have been updated since
      // date tracking has been added, they will have a date_updated
      // but not a date_created. Set the date_created to the date_updated
      if (dateUpdated) {
        return knex('publishedProjects').update('date_created', dateUpdated)
        .where('id', publishedProjectId);
      }

      // For existing published projects that have not been updated
      // since date tracking has been added - set both the dates
      // to the date_updated of the corresponding project
      return knex('projects')
      .where('published_id', publishedProjectId).select('date_updated')
      .then(function(projects) {
        if (!projects || !projects[0]) {
          return;
        }

        var date = projects[0].date_updated;

        // Update the date_created and date_updated fields in the
        // publishedProjects table
        return knex('publishedProjects')
        .where('id', publishedProjectId)
        .update({
          date_created: date,
          date_updated: date
        });
      });
    });
  });
};

exports.down = function (knex, Promise) {
  // This is an "update once" migration so that we do not lose data
  return Promise.resolve();
};
