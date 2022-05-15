const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

const socket = io();

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log(username, room);

// Get room users Info
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room),
    outputUsers(users)
})

// Join Chat rooms
socket.emit('joinRoom', {
    username,
    room
})

socket.on('message', message => {
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

})

// message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Getting message text
    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    // clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta"> ${message.userName} <span>${message.time}</span> </p>
    <p class="text"> ${message.textMessage} </p>
    `
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM 
function outputUsers(users) {
    console.log('usersList', users);
    usersList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location = '../index.html';
    } else {
    }
  });
