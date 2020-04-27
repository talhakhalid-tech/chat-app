const socket = io()

const buttonForm = document.querySelector('#form')
const term = document.querySelector('#input')
const button = document.querySelector('#sendBtn')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoScroll = () => {
    //new message element
    const $newMessage = messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    //height of messages container
    const containerHeight = messages.scrollHeight

    //how far i have scrolled?
    const scrollOffSet = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet){
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm A")
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message) => {
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})


socket.emit('join',{username,room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({room, users})=>{
    
    const html = Mustache.render(sidebarTemplate,{
        room,users
    })
    sidebar.innerHTML = html

})

form.addEventListener('submit',(event)=>{

    event.preventDefault()

    button.setAttribute('disabled','disabled')

    socket.emit('sendMessage',term.value,(error) => {

        button.removeAttribute('disabled')
        
        term.value = ''
        term.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message Delivered')
    })
})

const locationButton = document.querySelector('#location')

locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation is not supported by your browser')
    }

    locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{lat: position.coords.latitude,long: position.coords.longitude},()=>{
            locationButton.removeAttribute('disabled')
        })
    })
})
