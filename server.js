const express = require('express');
const path = require('path');
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);

const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'LoomChat Bot';


// Runs when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user.
        socket.emit('message', formatMessage(botName, 'Welcome to LoomChat'))

        // broadcast when user connects
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `A ${user.username} has joined the chat.`))


        // Send users and room Info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })




    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat.`));

            // Send users and room Info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })

    // listens for chat messages
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    });
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})