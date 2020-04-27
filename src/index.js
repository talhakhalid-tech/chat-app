const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname,'../public')

const port = process.env.PORT || 3000

app.use(express.static(publicPath))

io.on('connection',(socket)=>{


    socket.on('join',(options, callback) => {

        const {error, user} = addUser({id: socket.id, ...options })

        if(error){
           return callback(error)
        }

        socket.join(user.room)
        
        socket.emit('message',generateMessage('Admin','Welcome!'))

        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage',(message,callback)=> {

        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profane words not allowed!')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))

        callback()
    })

    socket.on('disconnect',()=>{
    
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation',(location,callback)=>{

        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?=${location.lat},${location.long}`))
        callback()
    })

})

server.listen(port,()=>{
    console.log(`server is up on port ${port}`)
})