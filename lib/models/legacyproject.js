/*

Old thimble models (from Django):

  'api.page': {
      'Meta': {'object_name': 'Page'},
      'creator': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'pages'", 'null': 'True', 'to': "orm['auth.User']"}),
      'html': ('django.db.models.fields.TextField', [], {'max_length': '10000'}),
      'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
      'original_url': ('django.db.models.fields.URLField', [], {'default': "''", 'max_length': '200', 'blank': 'True'}),
      'short_url_id': ('django.db.models.fields.CharField', [], {'max_length': '10', 'blank': 'True'})
  }

*/

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('LegacyProject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    creator: {
      type: DataTypes.STRING
    },

    // we only care about two fields, really.
    // this one...
    short_url_id: {
      type: DataTypes.STRING
    },

    original_url: {
      type: DataTypes.STRING
    },

    // ...and this one.
    html: {
      type: DataTypes.TEXT
    }
  },{
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};
