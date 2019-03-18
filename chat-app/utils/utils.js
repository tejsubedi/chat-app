module.exports = {
    ok(res) {
        return (data) => {
            res.json(data);
        };
    },
    fail(res) {
        return (error) => {
            console.log(error);
            res.sendStatus(404).end();
        };
    }
}