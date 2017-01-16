var optimizelyID = process.env.OPTIMIZELY_ID || '206878104';
var optimizelyActive = process.env.OPTIMIZELY_ACTIVE || 'no';

var Optimizely = {
  initialize: function() {
    if (optimizelyActive === 'yes') {
      var script = document.createElement('script');
      script.src = '//cdn.optimizely.com/js/' + optimizelyID + '.js';
      document.head.appendChild(script);
    }
  }
};

module.exports = Optimizely;
