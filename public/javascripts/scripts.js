// const { get } =require("../../config/connection")

function addtoCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)
            }
        }
    })
}
function changeQuantity(cartId,proId,userId,count,){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            userId:userId,
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
                if(response.removeProduct){
                    alert("product Removed from cart")
                    location.reload()
                }else{
                    document.getElementById(proId).innerHTML=quantity+count
                    document.getElementById('total').innerHTML=response.total
                }
            }
        
    })
}
function removeProduct(proId,cartId){
   
    $.ajax({
        url:'/remove-product',
        data:{
            product:proId,
            cart:cartId
        },
        method:'post',
        success:(response)=>{
            alert('Product deleted')
            location.reload()
        }

        
    })
}