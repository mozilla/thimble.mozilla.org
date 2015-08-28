var _gaq = _gaq || [];

(function() {
  var ga_account = document.getElementById("google-analytics-js").getAttribute("data-ga-account");
  var ga_domain = document.getElementById("google-analytics-js").getAttribute("data-ga-domain"); 

  _gaq.push(['_setAccount', ga_account]);

  if(ga_domain) {
    _gaq.push(['_setDomainName', ga_domain]);
  }

  _gaq.push(['_trackPageview']);

  var ga = document.createElement('script'); ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
