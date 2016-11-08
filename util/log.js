
const raven = require('raven');
const client = new raven.Client('https://038b0c8eafd44e08b61254bbcb8a1129:c329cefa99c04f6a801a80817471bea2@sentry.io/99802');

process.on('uncaughtException', function(err) {
    console.error(err);
});

client.patchGlobal();
client.APIError = function(message,err,info) {
    //console.log(req);
    var msg = err && err.message ? message + " | " + err.message : message;

    console.error(msg);

    if(info && info.body && info.body._user) {
        this.setUserContext({
            id: info.body._user
        });
    }

    this.captureException(new Error(msg),{
        extra:{
            URL:info.url,
            data:info.body,
            time:info.responseTime,
            steps:info.timing,
            err:err
        },
        tags:{
            App:'NODE',
            URL:info.url
        }
    });
    this.setUserContext();
};
client.backgroundError = function(message,err) {
    //console.log(req);
    var msg = err && err.message ? message + " | " + err.message : message;

    console.error(msg);
    this.captureException(new Error(msg),{
        tags:{
            App:'NODE_BACKGROUND'
        }
    });

};

module.exports = client;
