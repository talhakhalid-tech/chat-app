const users = []

const addUser = ({id,username,room}) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error: 'Username and Room are Required!!!'
        }
    }

    //check for existing user
    const existingUser = users.find(user =>{
        return user.username === username && user.room === room
    })

    //validate username
    if(existingUser){
        return {
            error: "Username Already In Use!!!"
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if(id !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) =>{
    const user = users.find(user => user.id === id)
    return user
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}