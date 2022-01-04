const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { order, item } = new PrismaClient();

router.get('',async(req,res)=>{ // Find all order of user
    const {user_id} = req.body;
    if(!user_id){
        res.status(203).json({'msg':'Not logged in.'});
    }
    const find_order = await order.findMany({
        where: {
            user_id: user_id
		},
    });
    res.status(200).json(find_order);
});

router.post("",async(req,res)=>{  // creates an item
    let {order_name,vendor,date_of_purchase, arrival_date, user_id} = req.body;
    date_of_purchase = new Date(date_of_purchase);
    arrival_date = new Date(arrival_date);
    order_name = order_name.trim();
    const create_order = await order.create({
        data:{
            order_name,
            vendor,
            date_of_purchase,
            arrival_date,
            user_id
        }
    });
    res.json(create_order);
});

router.delete('/',async(req,res)=>{ // Find specific order of user and all the items of the order
    const {order_id} = req.body;
    const contains_order = await order.findUnique({
        where:{
            order_id: order_id
        }
    });
    if(!contains_order){
        return res.status(203).json({'msg':'Order not found'})
    }
    const delete_items = await item.deleteMany({
        where:{
            order_id: order_id
        }
    });
    const find_order = await order.delete({
        where: {
			order_id: order_id,
		}
    });
    res.status(200).json(find_order);
});

router.put('/',async(req,res)=>{ // Edit order from user
    let {order_id, user_id, order_name, vendor, date_of_purchase, arrival_date, tax, savings, shipping} = req.body;
    if(!user_id){
        res.status(203).json({'msg':'Not logged in.'});
    }
    date_of_purchase = new Date(date_of_purchase);
    arrival_date = new Date(arrival_date);
    const get_price = await  order.findFirst({
        where:{
            order_id,
            user_id
        },
        select:{
            cost: true
        }
    });
    let cost = (parseFloat(get_price.cost)+parseFloat(shipping)+parseFloat(tax)-parseFloat(savings)).toFixed(2);
    const update_order = await order.update({
        where: {
            order_id
		},
        data:{
            order_name: order_name,
            vendor: vendor,
            tax: tax,
            savings: savings,
            shipping: shipping,
            date_of_purchase: date_of_purchase,
            arrival_date: arrival_date,
            total:{
                set: cost
            }
        }
    });
    res.json(update_order);
});


router.get('/search',async(req,res)=>{ // Find specific order of user
    const {order_name, user_id} = req.body;
    if(!user_id){
        res.status(203).json({'msg':'Not logged in.'});
    }
    const find_order = await order.findMany({
        where: {
			order_name:{
                contains: order_name,
                mode: 'insensitive'
            },
            user_id: user_id
		},
        orderBy:{
            cost: 'desc'
        }
    });
    res.status(200).json(find_order);
});

router.post("/:order_id",async(req,res)=>{  // add item to order
    let {item_name, item_price, category, user_id} = req.body;
    if(!user_id){
        res.status(203).json({'msg':'Not logged in'});
    }
    item_price = parseFloat(item_price).toFixed(2);
    let order_id = req.params.order_id;
    const check_owner = await order.findFirst({
        where:{
            order_id,
            user_id
        }
    });
    if(!check_owner){
        res.status(203).json({'msg':'Invalid Order Number'});
    }
    const create_item = await item.create({
        data:{
            item_name,
            item_price,
            category,
            order_id
        }
    });
    const update_info = await order.update({
        where:{
            order_id
        },
        data:{
            items:{
                 increment: 1
            },
            cost:{
                increment: item_price
            },
            total:{
                increment: item_price
            }
        }
    });
    res.json(create_item);
});

router.put("/:order_id",async(req,res)=>{  // edit item to order
    let {item_id, item_name, item_price, category} = req.body;
    let order_id = req.params.order_id;
    item_price = item_price.toFixed(2);
    const current_props = await item.findFirst({
        where:{
            item_id
        },
        select:{
            item_price:true
        }
    });
    let difference = parseFloat(item_price)-parseFloat(current_props.item_price);
    await order.update({
        where:{
            order_id
        },
        data:{
            cost:{
                increment: difference
            }
        }
    });
    const update_item = await item.update({
        where:{
            item_id
        },
        data:{
            item_name: item_name,
            item_price: item_price,
            category: category
        }
    })
    res.json(update_item);
});

router.delete("/:order_id",async(req,res)=>{  // edit item to order
    let {item_id} = req.body;
    let order_id = req.params.order_id;
    const check_item = await item.findFirst({
        where:{
            order_id,
            item_id
        }
    })
    if(!check_item){
        return res.status(203).json({'msg':'Cannot find the item'});
    }
    const {item_price} = await item.findUnique({
        where:{
            item_id
        },
        select:{
            item_price: true
        }
    });
    console.log(item_price);
    await order.update({
        where:{
            order_id
        },
        data:{
            cost:{
                decrement: item_price
            },
            items:{
                decrement:1
            },
            total:{
                decrement: item_price
            }
        }
    });
    const delete_item = await item.delete({
        where:{
            item_id
        }
    });
    return res.status(200).json(delete_item);
});
/*
Create Order - done
Edit Order Info - done
Delete Order - done
Get List of Orders - done
Search Order by Order Name - done
Add item to order - done
Delete Item from order - done
Edit item from order - done
*/
module.exports = router;
