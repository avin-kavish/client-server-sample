import { Server } from "socket.io"

const io = new Server({ /* options */ })

io.on("connection", (socket) => {

})

export default io
