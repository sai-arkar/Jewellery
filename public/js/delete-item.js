const declineItem = (btn)=>{
     const itemId = btn.parentNode.querySelector("[name=itemId]").value;
     const itemElement = btn.closest('tr');
     
     console.log(itemId);
     console.log('parent node',itemElement);

     fetch('/admin/item/'+itemId, {
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
          console.log("Deleted Item");
          itemElement.remove();
     })
     .catch(err=>{
          console.log(err);
     })
}