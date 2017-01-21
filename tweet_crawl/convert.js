const data = require('./enhanced_tweets.json');

console.log('language;text;class');

for(var i=0,l=data.length;i<l;i++) {
    var t = data[i];
    if(t.language.match(/en/))
        console.log('"'+t.language+'";"'+t.text.replace(/(\r|\n)/g," ").replace(/\s\s+/g," ").replace(/"/g,"'").trim()+'";');
}