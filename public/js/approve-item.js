const approveItem = (btn)=>{
     const itemId = btn.parentNode.querySelector("[name=itemId]").value;
     const itemElement = btn.closest('tr');
     let state = document.getElementById(`${itemId}`);
     
     console.log(itemId);
     console.log(document.getElementById(`${itemId}`).innerText);

     fetch('/admin/approve-item/'+itemId, {
          method: 'POST'
     })
     .then(data=>{
          return data.json();
     })
     .then((result)=>{
          console.log(result);
          console.log("Approve Item");
          state.innerText = "Approve";
     })
     .catch(err=>{
          console.log(err);
     })
}