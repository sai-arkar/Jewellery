const deleteEmployee = (btn)=>{
     const eId = btn.parentNode.querySelector("[name=userId]").value;
     // const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
     const employeeElement = btn.closest('tr');
     
     console.log(eId);
     console.log('parent node',employeeElement);

     fetch('/admin/delete-employee/'+eId, {
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
          employeeElement.remove();
     })
     .catch(err=>{
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     })
}