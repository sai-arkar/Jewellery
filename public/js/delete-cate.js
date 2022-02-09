const deleteCate = (btn)=>{
     const cateId = btn.parentNode.querySelector("[name=cateId]").value;
     // const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
     const cateElement = btn.closest('tr');
     
     console.log(cateId);
     console.log('parent node',cateElement);

     fetch('/admin/categories/'+cateId, {
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
          cateElement.remove();
     })
     .catch(err=>{
          console.log(err);
     })
}