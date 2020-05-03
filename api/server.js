const app = require('./src/app');
const nodeController = require('./src/controllers/nodeController');

const port = normalizaPort(process.env.PORT || '8080');

function normalizaPort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

app.listen(port, function () {
    console.log(`app listening on port ${port}`)
})

// cron that monitor the edge nodes status
var CronJob = require('cron').CronJob;

// runs once a minute
var job = new CronJob('0 */1 * * * *', function() {
// var job = new CronJob('* * * * * *', function() {
  nodeController.updateNdgeNodeStatus()
  //console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');

job.start();