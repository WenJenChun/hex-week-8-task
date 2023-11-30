// C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: [
        ['Louvre 雙人床架', 1],
        ['Antony 雙人床架', 2],
        ['Anty 雙人床架', 3],
        ['其他', 4],
        ],
        colors:{
            "Louvre 雙人床架":"#DACBFF",
            "Antony 雙人床架":"#9D7FEA",
            "Anty 雙人床架": "#5434A7",
            "其他": "#301E5F",
        }
    },
});

const api_path = "junew";
const token ="FzzujhuTyufNfhrGy1J8gJ4U0J53";
let orderData = [];
const orderList = document.querySelector("#orderList");

function init(){
    getAllOrders();
}
init();

function getAllOrders(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
        headers: {
            'Authorization': token
          }
    })
    .then((res)=>{
        orderData = res.data.orders;
        console.log(orderData);
        renderOrders();
    })
    .catch((err)=>{
        console.log(err);
    });

}


function renderOrders(){
    let str = "";
    orderData.forEach((item)=>{
        //該筆訂單的產品
        let orderProducts = [];
        item.products.forEach((product)=>{
            orderProducts.push(product.title);
        });

        //該筆訂單的建立時間
        let createdDate = new Date(item.createdAt*1000);
        let formatDate = `${createdDate.getFullYear()}-${createdDate.getMonth()+1}-${createdDate.getDate()}`;
       
        //該筆訂單狀態：已處理、未處理
        let orderStatus = "未處理";
        item.paid === false ? orderStatus = "未處理" : orderStatus = "已處理"

        str+=`<tr>
        <td>${item.id}</td>
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
            <p>${orderProducts.join(", ")}</p>
        </td>
        <td>${formatDate}</td>
        <td class="orderStatus">
            <a href="#" data-order-id="${item.id}">${orderStatus}</a>
        </td>
        <td>
            <input type="button" data-order-id="${item.id}" class="delSingleOrder-Btn" value="刪除">
        </td>
    </tr>`;

    });
    orderList.innerHTML = str;

    //每筆訂單加入訂單狀態監聽
    const orderStatusBtns = document.querySelectorAll(".orderStatus a");
    orderStatusBtns.forEach((item)=>{
        item.addEventListener("click",(e)=>{
            e.preventDefault();
            console.log(item);
            console.log(e.target.textContent);
            if(e.target.textContent==="未處理"){
                changeOrderStatus(e.target.dataset.orderId);
            } 
            
        })
    });

    //每筆訂單刪除按鈕監聽事件
    const delSingleOrderBtns = document.querySelectorAll(".delSingleOrder-Btn");
    delSingleOrderBtns.forEach((item)=>{
        item.addEventListener("click",(e)=>{
            e.preventDefault();
            console.log(e.target.dataset.orderId);
            deleteSingleOrder(e.target.dataset.orderId);
            alert(`成功刪除${e.target.dataset.orderId}`);
        });
    });
}


//變更訂單狀態：已處理、未處理
function changeOrderStatus(orderId){
    //訂單狀態如是未處理，點擊後要改成已處理
    //要更新訂單狀態 put  paid 為 true or false
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
          "id": orderId,
          "paid": true
        }
      },{
        headers: {
            'Authorization': token
          }
      }).then((res)=>{
        console.log(res);
        alert("訂單狀態已更改");
        getAllOrders();
      }).catch((err)=>{
        console.log(err);
      });
}

//刪除單一訂單
function deleteSingleOrder(orderId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then((res)=>{
        console.log(res);
        getAllOrders();

    })
    .catch((res)=>{
        console.log(res);
    });
}

//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    if(orderData.length === 0){
        alert("目前沒有任何訂單");
    } else {
        deleteAllOrder();
    }
});


function deleteAllOrder(){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then((res)=>{
        console.log(res);
        getAllOrders();
        renderOrders();
    })
    .catch((res)=>{
        console.log(res);
    });
}
