var Router = require('koa-router');
var router = new Router();



// get mongodb connection 
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://raj:raj667@ds117829.mlab.com:17829/chat-app', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

router.get('/api/history', async(ctx) => {
    ctx.body = await ctx.app.db.collection('chathistory').find().toArray();
});

router.post('/api/roomhistory', async(ctx) => {
    const requestbody = ctx.request.body;
    if (requestbody[0].roomname != '') {
        var roomname = await requestbody[0].roomname;
        ctx.body = await db.collection('chathistory').find({ roomName: roomname }).toArray();


    }
});

module.exports = router;