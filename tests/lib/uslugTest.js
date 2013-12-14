(function testTitle1() {
    var uslug = require("uslug");
    var input = "my title$_=日本語(笑)";
    var result = uslug(input);
    var expected = "my-title_日本語笑";
    if(result !== expected ) {
      process.exit(1);
    }
}());
