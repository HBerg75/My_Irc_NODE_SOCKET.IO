
const io = require('socket.io-client')
const socket = io('http://localhost:3000')
const readline = require('readline')
color = require('ansi-color').set

const rl = readline.createInterface(process.stdin, process.stdout);

rl.question("Quel est votre nom ? ", function(answer){
    console.log("Bonjour, " + answer)
    
    nick = answer;
    var msg = nick + " a rejoind le chat";
    socket.emit('nick', { message: nick, id: socket.id });
    socket.emit('msg', {type: 'notice', message: msg});
    rl.prompt(true);
})



function console_out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}



rl.on('line', function (line) {
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
 
    } else {
        // send chat message
        socket.emit('send', { type: 'chat', message: line, nick: nick });
        rl.prompt(true);
    }
});

function chat_command(cmd, arg) {
    switch (cmd) {
 
        case 'nick':
            nick = arg;
            socket.emit('nick', { message: nick, id: socket.id });
            break;

        case 'users':
           socket.emit('users');
           break;

 
        case 'msg':
            var to = arg.match(/[a-z]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: nick });
            break;
 
        case 'me':
            var emote = nick + " " + arg;
            socket.emit('send', { type: 'emote', message: emote });
            break;
 
        default:
            console_out("Ceci n'est pas une commande valide.");
 
    }
}

socket.on('message', function (data) {
    var leader;
    if (data.type == 'chat' && data.nick != nick) {
        leader = color("<"+data.nick+"> ", "green");
        console_out(leader + data.message);
    }
    else if (data.type == 'chat' && data.nick == nick) {
        leader = color("<"+data.nick+"> ", "yellow");
        console_out(leader + data.message);
    }
    else if (data.type == "notice") {
        console_out(color(data.message, 'green'));
    }
    else if (data.type == "tell" && data.to == nick) {
        leader = color("["+data.from+"->"+data.to+"]", "red");
        console_out(leader + data.message);
    }
    else if (data.type == "emote") {
        console_out(color(data.message, "cyan"));
    }
});
socket.on("user_list", function(data) {
    console_out(data);
})