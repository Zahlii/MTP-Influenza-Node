
const raven = require('raven');
const client = new raven.Client('https://038b0c8eafd44e08b61254bbcb8a1129:c329cefa99c04f6a801a80817471bea2@sentry.io/99802');
client.patchGlobal();
client.APIError = function(message,err,req) {
    //console.log(req);
    var msg = err && err.message ? message + " | " + err.message : message;

    console.log(msg);

    if(req && req.body && req.body._user) {
        this.setUserContext({
            id: req.body._user
        });
    }
    if(!req) {
        req = {
            url:'*',
            data:{},
            time:0,
            steps:[]
        }
    }
    this.captureException(new Error(msg),{
        extra:{
            URL:req.url,
            data:req.body,
            time:req.responseTime,
            steps:req.timing
        },
        tags:{
            App:'NODE',
            URL:req.url
        }
    });
    this.setUserContext();
};
client.backgroundError = function(message,err) {
    //console.log(req);
    var msg = err && err.message ? message + " | " + err.message : message;

    console.log(msg);
    this.captureException(new Error(msg),{
        tags:{
            App:'NODE_BACKGROUND'
        }
    });

};

module.exports = client;
