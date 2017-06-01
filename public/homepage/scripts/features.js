define(["jquery"], function($) {

  var features = {
    init: function(){
      this.feature = $(".feature");

      var touch = "ontouchstart" in document;
      if (touch){
          var videoDiv;
          this.feature.bind('touchstart',function(event){
             $('video').get(0).pause();
             $('video', this).get(0).play();
             var touch = event.touches[0];
             videoDiv = document.elementFromPoint(touch.pageX,touch.pageY);
          });
          this.feature.bind('changedTouches',function(event){
             var touch = event.touches[0];
             if (document.elementFromPoint(touch.pageX,touch.pageY) !== videoDiv) {
                $('video', this).get(0).pause();
              }
          });
       }
      
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
