function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function() {
            if (done) {
                return;
            }

            if (index < iterations) {
                index++;
                func(loop);

            } else {
                done = true;
                callback();
            }
        },

        iteration: function(item) {
            return index - 1;
        },

        break: function() {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
}
var demooo = []
function someFunction(item, callback) {
    console.log(item);
    demooo.push(item)
    callback()
}
var array = ["primer elemento","segundo elemento"]

asyncLoop(2, function(loop) {
    someFunction(array[loop.iteration()], function(result) {

        // log the iteration
        //console.log(result)
        console.log(loop.iteration(result));

        // Okay, for cycle could continue
        loop.next();
    })},
    function(){
      console.log('cycle ended')
      console.log(demooo)
    }
);