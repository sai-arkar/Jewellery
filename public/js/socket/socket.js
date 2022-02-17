let name 
let socket = io()

// do {
//     username = prompt('Enter your name: ')
// } while(!username)

const textarea = document.querySelector('#textarea')
const submitBtn = document.querySelector('#submitBtn')
const commentBox = document.querySelector('.comment__box')
let nameBox = document.querySelector('.username');
let itemIdBox = document.querySelector('.itemId');


submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    let comment = textarea.value
    if(!comment) {
        return
    }
    postComment(comment)
})

function postComment(comment) {
    // Append to dom
    let data = {
        username: nameBox.value,
        comment: comment
    }
    appendToDom(data)
    textarea.value = ''
    // Broadcast
    broadcastComment(data)
    // Sync with Mongo Db
    syncWithDb(data)

}

function appendToDom(data) {
    let lTag = document.createElement('div')

    let markup = `  <div class="d-flex mt-3">
                      <div class="flex-shrink-0">
                        <img alt="Image placeholder" class="avatar rounded-circle" src="/img/team-5.jpg">
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <h6 class="h5 mt-0">${data.username}</h6>
                        <p class="text-sm">${data.comment}</p>
                        <div class="d-flex">
                         <small>${(data.time)}</small>
                        </div>
                      </div>
                    </div>
               `;
    lTag.innerHTML = markup

    commentBox.prepend(lTag)
}

function broadcastComment(data) {
    // Socket
    socket.emit('comment', data)
}

socket.on('comment', (data) => {
    appendToDom(data)
})

// let timerId = null
// function debounce(func, timer) {
//     if(timerId) {
//         clearTimeout(timerId)
//     }
//     timerId = setTimeout(() => {
//         func()
//     }, timer)
// }

// let typingDiv = document.querySelector('.typing')
// socket.on('typing', (data) => {
//     typingDiv.innerText = `${data.username} is typing...`
//     debounce(function() {
//         typingDiv.innerText = ''
//     }, 1000)
// })

// Event listner on textarea
// textarea.addEventListener('keyup', (e) => {
//     socket.emit('typing', { username })
// })

// Api calls 

function syncWithDb(data) {
    const headers = {
        'Content-Type': 'application/json'
    }
    fetch('/admin/comments', { method: 'Post', body:  JSON.stringify(data), headers})
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
}

function fetchComments () {

    fetch('/items/'+ itemIdBox.value)
        .then(res => res.json())
        .then(result => {
            result.forEach((comment) => {
                comment.time = comment.createdAt
                appendToDom(comment)
            })
        })
}

window.onload = fetchComments