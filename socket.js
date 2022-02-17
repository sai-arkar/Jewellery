let io;

module.exports = {
    init: (httpServer)=>{
        io = require('socket.io')(httpServer, {
            cors: {
                origin: 'http://localhost:8080', 
                methods: ['GET, POST, PUT, PATCH, DELETE, OPTIONS']
            }
        });
        return io;
    },
    getIo: ()=>{
        if(!io){
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};