const api_path = "junew";
const token ="FzzujhuTyufNfhrGy1J8gJ4U0J53";
let productData = [];
let cartData = [];

const productWrap = document.querySelector(".productWrap");
const cartSection = document.querySelector(".shoppingCart-table");
const cartList = document.querySelector(".shoppingCart-table tbody");

const cartTotalPrice = document.querySelector("#cartTotalPrice");
const discardAllBtn = document.querySelector(".discardAllBtn");

function init(){
    renderProducts();
    getCartList();
}

init();

function renderProducts(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((res)=>{
        // console.log(res.data.products);
        productData = res.data.products;
        let str = "";
        productData.forEach((item)=>{
            str += `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-product-title="${item.title}" data-product-id="${item.id}">加入購物車</a>
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
                // console.log(productId);
                addTOCart(productId, 1);
                alert(`已將${e.target.dataset.productTitle}加入購物車`);
                
                //在這邊沒有及時 render，要用 location.reload(); 或 assync await?
                
                
            });
        });


        
  }).catch((err)=>{
    console.log(err);
  });
}

function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
      .then((res)=>{
      cartData = res.data.carts;
      console.log(cartData);
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
                <a href="#" class="material-icons" data-product-title="${item.product.title}" data-cart-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`;
        });
        cartList.innerHTML = str;
        cartTotalPrice.textContent = `NT$${finalPrice}`;

        const deleteBtns = document.querySelectorAll(".discardBtn .material-icons");
        deleteBtns.forEach((item)=>{
            item.addEventListener("click",(e)=>{
                e.preventDefault();
                // console.log(e.target.dataset.cartId);
                alert(`成功刪除${e.target.dataset.productTitle}`);
                deleteCartItem(e.target.dataset.cartId);
                
            });
            
        });
        
    }
      
    
    }).catch((err)=>{
      console.log(err);
    });
}

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
   
    getCartList();
    location.reload(); //如果不加的話有時候不會即時更新
    
  }).catch((error)=>{
    console.log(error.data);
  });
}

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    deleteAll();
});

function deleteAll(){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then((res)=>{
        console.log(res);
        alert("您已清空購物車");
        getCartList();
    })
    .catch((err)=>{
        console.log(err)
    });
}

function deleteCartItem(cartItemId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartItemId}`)
    .then((res)=>{
        console.log(res);
        getCartList();
    })
    .catch((err)=>{
        console.log(err)
    });
}

const orderInfoForm = document.querySelector(".orderInfo-form");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddres = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderBtn = document.querySelector("#orderBtn");
let isFormValid = false;
tradeWay.addEventListener("change",(e)=>{
    // console.log(tradeWay.value);
});

function validateForm(){
    
    const validMessages = document.querySelectorAll('p.orderInfo-message');
    validMessages.forEach((item)=>{
        if(item.dataset.message==="姓名" && validator.isEmpty(customerName.value)){
            item.textContent="請填寫名稱";
            isFormValid = false;
        } else if (item.dataset.message==="電話" && !validator.isMobilePhone(customerPhone.value, 'zh-TW')){
            item.textContent="請填寫正確手機號碼";
            isFormValid = false;
        } else if (item.dataset.message==="Email" && !validator.isEmail(customerEmail.value)){
            item.textContent="請填寫正確 Email";
            isFormValid = false;
        } else if (item.dataset.message==="寄送地址" && validator.isEmpty(customerAddres.value)){
            item.textContent="請填寫地址";
            isFormValid = false;
        } else {
            item.textContent="";
            isFormValid = true
        }
    });

    
   
    

}

orderBtn.addEventListener("click",(e)=>{
    e.preventDefault();
   
    // if (cartData.length === 0){
    //     alert("購物車是空的！");
    //     return;
    // }
    //三元運算符含 return 寫法：
    if (cartData.length === 0) return alert("購物車是空的！");

    validateForm();
    if (isFormValid) {
        postOrder();
    } 
   

});

//送出訂單
function postOrder(){
    let obj = {};
    obj.name = customerName.value;
    obj.tel = customerPhone.value;
    obj.email = customerEmail.value;
    obj.address = customerAddres.value;
    obj.payment = tradeWay.value;
    
        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
        "data": {
          "user": obj
        //   {
        //     "name": "六角學院",
        //     "tel": "07-5313506",
        //     "email": "hexschool@hexschool.com",
        //     "address": "高雄市六角學院路",
        //     "payment": "Apple Pay"
        //   }
        }
      }).then((res)=>{
        console.log(res)
        alert("成功送出訂單");
        // orderInfoForm.reset();
        window.location.reload();
        window.scrollTo(0, 0);

    }).catch((err)=>{
        console.log(err);
        alert("訂單送出失敗");
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
