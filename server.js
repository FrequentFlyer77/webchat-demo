const express = require("express");
const wss = require("ws");

let app = express();
let server = new wss.WebSocketServer({port: 3001});

app.use((req, res, next) => {
    console.log("Ping");
    next();
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

app.listen(3000);

server.on("connection", (ws) => {
    let identifier = `user${rng(255, 0).toString()}`
    ws.on("message", (msg) => {
        if (msg.toString().startsWith("/")) {
            const args = msg.toString().substring(1).split(" ");
            switch(args[0]) {
                case "rename":
                    if (args[1]!==undefined) {
                        if (args[1].match(/^[a-zA-Z0-9\_]*$/)) {
                            identifier = args[1]
                            ws.send("You have now renamed yourself to " + args[1], { binary: false });
                        } else {
                            ws.send("Usernames must only contain letters, numbers, and a underscore.", { binary: false });
                        }
                    } else {
                        ws.send("Usage: /rename [name]", { binary: false });
                    }
                    break;
                default:
                    ws.send(msg.toString() + " is not a valid command!", { binary: false });
                    break;
            }
        } else {
            server.clients.forEach(socket => {
                socket.send(identifier + ": " + msg.toString(), { binary: false });
            })
        }
    });
})

function rng(high, low) {
    return Math.round(Math.random() * (high - low) + low);
}