var Router = require('koa-router');
var router = new Router();

router.get('/api/eventlog', async(ctx) => {
    ctx.body = await ctx.app.db.collection('eventlogs').find().toArray();
});

module.exports = router;