const api_path = "junew";
const token ="FzzujhuTyufNfhrGy1J8gJ4U0J53";
let productData = [];
let cartData = [];

const productWrap = document.querySelector(".productWrap");
const cartSection = document.querySelector(".shoppingCart-table");
const cartList = document.querySelector(".shoppingCart-table tbody");

const cartTotalPrice = document.querySelector("#cartTotalPrice");
const discardAllBtn = document.querySelector(".discardAllBtn");

function renderProducts(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res)=>{
        console.log(res.data.products);
        productData = res.data.products;
        let str = "";
        productData.forEach((item)=>{
            str += `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-product-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`;
        });
        productWrap.innerHTML = str;

        const addCardBtns = document.querySelectorAll(".addCardBtn");
        addCardBtns.forEach((item)=>{
            item.addEventListener("click",(e)=>{
                e.preventDefault();
                let productId = e.target.dataset.productId;
                console.log(productId);
                addTOCart(productId, 1);
                //在這邊沒有及時 render，要用 location.reload(); 或 assync await?
                renderCartList();
                
            });
        });


        
  }).catch((err)=>{
    console.log(err);
  });
}

renderProducts()

function renderCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res)=>{
    cartData = res.data.carts;

    if(cartData.length === 0){
        cartSection.innerHTML = `<p>您尚未加入任何商品</p>`;
    } else {
        let str = "";
        let finalPrice = 0;
        cartData.forEach((item)=>{
            let itemTotalPrice = Number(item.quantity*item.product.price);
            finalPrice += itemTotalPrice;
            // console.log(itemTotalPrice);
            str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${itemTotalPrice}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons">
                    clear
                </a>
            </td>
        </tr>`;
        });
        cartList.innerHTML = str;
        cartTotalPrice.textContent = `NT$${finalPrice}`;
    }
    
  }).catch((err)=>{
    console.log(err);
  });
}

renderCartList()

function addTOCart(productId, quantity){
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, 
  {
    data: {
    "productId": productId,
    "quantity": quantity
    }}
  )
    .then((res)=>{
    console.log(res.data);
    location.reload();
  }).catch((error)=>{
    console.log(error.data);
  });
}

// addTOCart();

discardAllBtn.addEventListener("click",function(e){
    deleteAll();
    renderCartList();
});

function deleteAll(){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res)=>{
        console.log(res);
        location.reload();
    })
    .catch((err)=>{
        console.log(err)
    });
}

// deleteAll()

function deleteCartItem(cartIemtId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartIemtId}`)
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err)
    });
}

function postOrder(){
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
        "data": {
          "user": {
            "name": "六角學院",
            "tel": "07-5313506",
            "email": "hexschool@hexschool.com",
            "address": "高雄市六角學院路",
            "payment": "Apple Pay"
          }
        }
      }).then((res)=>{
        console.log(res)
    }).catch((err)=>{
        console.log(err)
    });
}

function getAllOrders(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
        headers: {
            'Authorization': token
          }
    })
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    });

}
