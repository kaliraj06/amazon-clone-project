export let cart = JSON.parse(localStorage.getItem('cart'));

if(!cart){
    cart = [{
    productId:'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
    quantity:2,
    deliveryOptionId:'1'

},{
    productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
    quantity:1,
    deliveryOptionId:'2'
}];
}



export function saveToStorage() {
    localStorage.setItem('cart',JSON.stringify(cart));
}

 export function removeItem(productId) {
   
    let newCart = [];
    cart.forEach((mcingItm) => {
        if(mcingItm.productId !== productId){
            newCart.push(mcingItm)
        }
    });
    cart = newCart;

    saveToStorage();
}

 export function updateDeliveryOption(productId,deliveryOptionId){
    let matchingItem;
    cart.forEach((item) => {
      if (item.productId === productId) {
        matchingItem = item;
      }
    });
    matchingItem.deliveryOptionId = deliveryOptionId;
    saveToStorage();

}

