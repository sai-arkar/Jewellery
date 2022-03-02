const deleteComment = (btn)=>{
     const cId = btn.parentNode.querySelector("[name=cId]").value;
     const uId = btn.parentNode.querySelector("[name=uId]").value;
     const cElement = btn.closest('#comment');
     
     console.log(cId);
     console.log('parent node',cElement);

     fetch('/admin/comment/'+uId+'/'+cId, {
          method: 'DELETE'
     })
     .then(data=>{
          return data.json();
     })
     .then((result)=>{
          console.log(result);
          cElement.remove();
     })
     .catch(err=>{
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     })
}