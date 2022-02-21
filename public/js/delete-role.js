const deleteRole = (btn)=>{
     const roleId = btn.parentNode.querySelector("[name=roleId]").value;
     // const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
     const roleElement = btn.closest('tr');
     
     console.log(roleId);
     console.log('parent node',roleElement);

     fetch('/admin/delete-role/'+roleId, {
          method: 'DELETE'
          // ,
          // headers: {
          //      'csrf-token': csrf
          // }
     })
     .then(data=>{
          return data.json();
     })
     .then((result)=>{
          console.log(result);
          roleElement.remove();
     })
     .catch(err=>{
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     })
}