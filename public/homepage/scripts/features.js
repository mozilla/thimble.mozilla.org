define(["jquery"], function($) {

  var features = {
    init: function(){
      this.feature = $(".feature");

    	this.feature.mouseenter(function(){
        $('video', this).get(0).play(); 
      });
      	
      this.feature.mouseleave(function(){
        $('video', this).get(0).pause(); 
      });
  	}
  };
  
  return features;
});


