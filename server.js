const port = 3000
const io = require('socket.io')(port)
console.log('server is in port : ', port)

let users = [];
io.sockets.on('connection', function (socket) {
    console.log(socket.id);
    socket.on('send', function(data)  {
        io.sockets.emit('message', data)
    })

    socket.on('nick', data => {
        //chercher l'id correspondant à l'user
        // si c'est dans le tableau d'user modifier le nom
        // sinon push l'user dans le tableau
        let changed = false;
        if (users.length === 0) {
            users.push({username : data.message, id: data.id});
            console.log(users);
        } else {
        for (let i = 0; i < users.length; i++) {
            if (data.id === users[i].id){
                users[i].username = data.message;
                changed = true;
                console.log(users);
            }
        }
        if (changed == false) {
            users.push({username : data.message, id: data.id});
            console.log(users)
        }    
    }
    })

    socket.on('users', function(data){
        socket.emit('user_list',users);
    })
})

