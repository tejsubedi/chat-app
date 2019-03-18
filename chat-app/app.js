var serve = require('koa-static');
var send = require('koa-send');
const bodyParser = require('koa-bodyparser');

var koa = require('koa');
var app = new koa();

app.use(bodyParser());
var path = require('path');
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);

const mongoose = require('mongoose');

const historyRouter = require('./routes/history');
const eventlogRouter = require('./routes/eventlog');

// get mongodb connection
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://raj:raj667@ds117829.mlab.com:17829/chat-app', { useNewUrlParser: true });
const db = mongoose.connection;
app.db = db;
db.on('error', console.error.bind(console, 'connection error:'));
//console.log('mongodb connected');

const PORT = process.env.PORT || 5000;

var userList = [];

app.use(serve(path.join(__dirname, 'public')));

app.use(historyRouter.routes()).use(historyRouter.allowedMethods());
app.use(eventlogRouter.routes()).use(eventlogRouter.allowedMethods());

app.use(function* index() {
    yield send(this, __dirname + '/public/index.html');
});

//Socket listen by server

var numuser = 0;

const roomList = [{ id: 1, name: 'Alberta' },
    { id: 2, name: 'British Columbia' },
    { id: 3, name: 'Manitoba' },
    { id: 4, name: 'New Brunswick' },
    { id: 5, name: 'Nova Scotia' },
    { id: 6, name: 'Ontario' },
    { id: 7, name: 'Prince Edward Island' },
    { id: 8, name: 'Quebec' },
    { id: 9, name: 'Saskatchewan' },
    { id: 10, name: 'Yukon' }
]
const chatMessage = [];

const addChatMessage = function(user, message, room) {
    const _chatmessage = {
        user: user,
        message: message,
        room: room
    }
    chatMessage.push(_chatmessage);
}

io.on('connection', function(socket) {
    socket.on('joinroom', (roomname) => {
        socket.join(roomname);
        socket.roomList.push({ 'roomname': roomname, 'username': socket.userName });
        socket.roomName = roomname;
        io.sockets.to(roomname).emit('joinroom', socket.userName, socket.roomName);

        eventLog('joinroom', socket.userName);
    });

    socket.on('register user', (v) => {

        const email = v.email;
        const nickname = v.nickName;
        socket.userName = email;
        socket.nickName = nickname;

        checkEmail(email, (r) => {
            if (!r) {
                const emailObject = { 'email': email };
                userList.push(emailObject);
                socket.userName = email;
                socket.nickName = nickname;
                socket.roomList = roomList;
                socket.chatMessage = chatMessage;


                addChatMessage(email, 'Joined', null);

                io.sockets.emit('register user', socket.userName, socket.nickName, socket.roomList, socket.chatMessage);
            } else {
                console.log('already done' + email);
            }
        })
        eventLog('Connection', socket.userName);
    });

    //Send message 
    socket.on('sendmessage', (v) => {
        const room = socket.roomList.find(x => x.username === socket.userName);
        let chatHistorySchema = {
            username: v.user,
            usernick: v.nick,
            message: v.message,
            roomName: null
        };
        if (room === undefined) {
            db.collection('chathistory').insertOne(chatHistorySchema);
            io.sockets.emit('sendmessage', v);
        } else {
            chatHistorySchema.roomName = room.roomname;
            db.collection('chathistory').insertOne(chatHistorySchema);
            io.sockets.to(room.roomname).emit('sendmessagetoroom', v);
        }
    });

    // disconnect 
    socket.on('disconnect', () => {

        io.sockets.emit('disconnect', socket.userName);
        eventLog('Disconnect', socket.userName);
    });
});


/* General function */
const checkEmail = function(email, callback) {
    if (userList.length > 0) {
        const user = userList.find(x => x.email === email);
        if (user === undefined) {
            callback(false);
        } else {
            callback(true);
        }
    } else callback(false);
}

const eventLog = function(event, username) {
    const _eventlog = {
        'event': event,
        'date': new Date(),
        'user': username
    }
    db.collection('eventlogs').insertOne(_eventlog);
}

server.listen(PORT, () => {
    console.log('Server is running on PORT %d', PORT);
});