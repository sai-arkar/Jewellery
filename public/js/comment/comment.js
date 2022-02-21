const comment = (btn)=>{
     const itemId = btn.parentNode.querySelector("[name=itemId]").value;
     const username = btn.parentNode.querySelector("[name=username]").value;
     const comment = btn.parentNode.querySelector("[name=comment]").value;

     let commentBox = document.querySelector('.comment__box');

     let data = {
          itemId: itemId,
          username: username,
          comment: comment
     }
     console.log(commentBox);

     // console.log(itemId, username, comment);

     let markup = `  <div class="bg-gradient-light bg-opacity-10 border-radius-lg border-0  mt-2">
                         <div class="flex-grow-1 ms-3">
                              <h6 class="h5 mt-0">${data.username}</h6>
                              <p class="text-sm">${data.comment}</p>
                              <div class="d-flex">
                                   <small></small>
                              </div>
                         </div>
                    </div>
               `;

     fetch('/admin/comment/', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
     })
     .then(data=>{
          return data.json();
     })
     .then((result)=>{
          console.log(result);
          commentBox.innerHTML += markup;
          comment.value = 'asdfasdfasdf';
     })
     .catch(err=>{
          console.log(err);
     })
}