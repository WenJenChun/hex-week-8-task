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
        // orderData = res.data.orders;
        orderData = res.data.orders.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            // 以降序排序，最新的在最前面
            return dateB - dateA;
          });
        console.log(orderData);
        renderOrders();
        renderChart();
    })
    .catch((err)=>{
        console.log(err);
    });

}

function renderOrders(){
    let str = "";
    orderData.forEach((item)=>{
        //該筆訂單的產品
        
        let productsStr = "";
        item.products.forEach((product)=>{
            productsStr+=`<li>${product.title}</li>`;
            // orderProducts.push(product.title);
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
            <ul>${productsStr}</ul>
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
  
    if(orderData.length === 0){
        orderList.innerHTML = "<tr><td colspan='8' style='text-align: center;'>無訂單</td></tr>";
    } else {
        orderList.innerHTML = str;
    }

    //每筆訂單加入訂單狀態監聽
    const orderStatusBtns = document.querySelectorAll(".orderStatus a");
    orderStatusBtns.forEach((item)=>{
        item.addEventListener("click",(e)=>{
            e.preventDefault();
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
            // console.log(e.target.dataset.orderId);
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

// C3.js
function renderChart(){
    // 做全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」
    let tempProductQtyObj = {};
    let productTitleArr = [];
    let c3DataArr = [];
    //把每個項目變成 {"項目":"數量"} 的格式
    orderData.forEach((order)=>{
        order.products.forEach((product)=>{
            if(tempProductQtyObj[product.title]){
                tempProductQtyObj[product.title]+=product.price * product.quantity;
            } else {
                tempProductQtyObj[product.title]=product.price * product.quantity;
            }
        });
    });
    // console.log(tempProductQtyObj);
    

    //把 {"項目":"數量"} 變成 ["項目", 數量] 的格式
    productTitleArr = Object.keys(tempProductQtyObj);
    productTitleArr.forEach((item)=>{
        // 在這邊比較數量
        let arr = [];
        arr.push(item);
        arr.push(tempProductQtyObj[item]);
        //把["項目", 數量]加進最終使用的陣列
        c3DataArr.push(arr);
        //依數量排序，最多的在前面
        c3DataArr.sort(function(a,b){
            return b[1]-a[1];
        });
    });
    // Object.entries(tempProductQtyObj)也可以達到一樣的結果
    // console.log(c3DataArr);
    let finalC3Data=[];
    if(c3DataArr.length >=4){
        //前三名
        finalC3Data = [c3DataArr[0],c3DataArr[1],c3DataArr[2]];
        //第四名以後的加總
        let otherTotalPrice = 0;
        c3DataArr.forEach((arr,i)=>{
            if(i>2){
                console.log(arr);
                otherTotalPrice += arr[1];
            }
        });

        finalC3Data.push(["其他",otherTotalPrice]);
    } else {
        finalC3Data = c3DataArr;
    }
    
    
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: finalC3Data,
        },
        color: {
            pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F', '#2ca02c', '#98df8a', '#d62728', '#ff9896', ]
        }
    });
}
