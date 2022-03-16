// @ts-nocheck
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { order, item } = new PrismaClient();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const FormData = require('form-data');
const client_id = process.env.imgur_client_id;
// const Headers = require('headers');

router.get('', async (req, res) => { // Find all order of user
    const user_id = String(req.query['user_id']);
    const order_name = req.query['query'] || "";
    const sortQuery = req.query['sortQuery'] || "cost";
    const ascDesc = req.query['ascDesc'] || 'asc';
    let start_date = req.query['start_date'] || '2000-01-01';
    let end_date = req.query['end_date'] || '2100-1-01';
    start_date = new Date(start_date);
    end_date = new Date(end_date);
    if (!user_id) {
        return res.status(203).json({ 'msg': 'Not logged in.' });
    }
    const find_order = await order.findMany({
        where: {
            user_id,
            OR: [{  
                order_name: {
                    contains: order_name,
                    mode: 'insensitive'
                }
            }, {
                vendor: {
                    contains: order_name,
                    mode: 'insensitive'
                }
            }],
            date_of_purchase:{
                gte: start_date,
                lte: end_date
            }
        },
        orderBy: {
            [sortQuery]: ascDesc
        }
    });
    return res.status(200).json(find_order);
});
const createURL = async (data) => {
    const formdata = new FormData();
    formdata.append("image", data);
    const requestOptions = {
        method: 'POST',
        headers: { "Authorization": `Client-ID ${client_id}` },
        body: formdata,
        redirect: 'follow'
    };
    let res;
    try{
        res = await fetch("https://api.imgur.com/3/image", requestOptions).then(res => res.json());
    }catch (err){
        res = await fetch("https://api.imgur.com/3/upload", requestOptions).then(res => res.json());
    }
    console.log(res)
    return res;
}
router.post("", async (req, res) => {  // creates an order
    let { order_name, vendor, date_of_purchase, arrival_date, user_id, tax, shipping, savings, image_url } = req.body;
    // get image url by making a post request to imgur and getting the url
    if (image_url !== "") {
        image_url = await createURL(image_url);
        image_url = image_url.data.link;
        if (!image_url) return res.status(203).json({ msg: `Image cannot be processed` });
    } else {
        image_url = "https://i.imgur.com/Vx6P5nq.png"
    }
    const total = parseFloat(shipping) + parseFloat(tax) - parseFloat(savings);
    date_of_purchase = new Date(date_of_purchase);
    arrival_date = new Date(arrival_date);
    order_name = order_name.trim();
    const create_order = await order.create({
        data: {
            order_name,
            vendor,
            date_of_purchase,
            arrival_date,
            user_id,
            tax,
            shipping,
            savings,
            image_url,
            total
        }
    });
    return res.json(create_order);
});

router.delete('/', async (req, res) => { // Find specific order of user and all the items of the order
    const { order_id } = req.body;
    const contains_order = await order.findUnique({
        where: {
            order_id: order_id
        }
    });
    if (!contains_order) {
        return res.status(203).json({ 'msg': 'Order not found' })
    }
    const delete_items = await item.deleteMany({
        where: {
            order_id: order_id
        }
    });
    const find_order = await order.delete({
        where: {
            order_id: order_id,
        }
    });
    return res.status(200).json(find_order);
});

router.put('/', async (req, res) => { // Edit order from user
    let { order_id, user_id, order_name, vendor, date_of_purchase, arrival_date, tax, savings, shipping, image_url } = req.body;
    if (image_url !== "") {
        image_url = await createURL(image_url);
        image_url = image_url.data.link;
        if (!image_url) return res.status(203).json({ msg: `Image cannot be processed` });
    } else {
        const url = await order.findFirst({
            where: {
                order_id
            },
            select: {
                image_url: true
            }
        });
        image_url = url.image_url;
    }
    if (!user_id) {
        return res.status(203).json({ 'msg': 'Not logged in.' });
    }
    date_of_purchase = new Date(date_of_purchase);
    arrival_date = new Date(arrival_date);
    const get_price = await order.findFirst({
        where: {
            order_id
        },
        select:{
            cost:true
        }
    });
    let cost = (parseFloat(get_price.cost) + parseFloat(shipping) + parseFloat(tax) - parseFloat(savings)).toFixed(2);
    const update_order = await order.update({
        where: {
            order_id
        },
        data: {
            order_name: order_name,
            vendor: vendor,
            tax: tax,
            savings: savings,
            shipping: shipping,
            date_of_purchase: date_of_purchase,
            arrival_date: arrival_date,
            image_url: image_url,
            total: {
                set: cost
            }
        }
    });
    return res.json(update_order);
});
router.get("/:order_id", async (req, res) => { // get items from order
    const user_id = String(req.query['user_id']);
    const order_id = req.params.order_id;
    const item_name = String(req.query['query'])|| "";
    if (!user_id) {
        return res.status(203).json({ 'msg': 'Not logged in' });
    }
    const getItems = await item.findMany({
        where: {
            order_id,
            item_name: {
                contains: item_name,
                mode: 'insensitive'
            }
        },
    });
    return res.status(200).json(getItems);
});
router.post("/:order_id", async (req, res) => {  // add item to order
    let { item_name, item_price, category, user_id } = req.body;
    let order_id = req.params.order_id;
    if (!user_id) {
        return res.status(203).json({ 'msg': 'Not logged in' });
    }
    item_price = parseFloat(item_price).toFixed(2);


    const create_item = await item.create({
        data: {
            item_name,
            item_price,
            category,
            order_id: order_id
        }
    });
    const update_info = await order.update({
        where: {
            order_id
        },
        data: {
            items: {
                increment: 1
            },
            cost: {
                increment: item_price
            },
            total: {
                increment: item_price
            }
        }
    });
    return res.json(create_item);
});

router.put("/:order_id", async (req, res) => {  // edit item to order
    let { item_id, item_name, item_price, category } = req.body;
    let order_id = req.params.order_id;
    item_price = parseFloat(item_price);
    const current_price = await item.findFirst({
        where: {
            item_id
        },
        select: {
            item_price: true
        }
    });
    const difference = parseFloat((item_price - current_price.item_price).toFixed(2));
    await order.update({
        where: {
            order_id
        },
        data: {
            cost: {
                increment: difference
            },  
            total: {
                increment: difference
            }
        }
    });
    const update_item = await item.update({
        where: {
            item_id
        },
        data: {
            item_name,
            item_price,
            category
        }
    })
    return res.json(update_item);
});

router.delete("/:order_id", async (req, res) => {  // edit item to order
    let { item_id } = req.body;
    let order_id = req.params.order_id;
    const check_item = await item.findFirst({
        where: {
            order_id,
            item_id
        }
    })
    if (!check_item) {
        return res.status(203).json({ 'msg': 'Cannot find the item' });
    }
    const { item_price } = await item.findUnique({
        where: {
            item_id
        },
        select: {
            item_price: true
        }
    });
    await order.update({
        where: {
            order_id
        },
        data: {
            cost: {
                decrement: item_price
            },
            items: {
                decrement: 1
            },
            total: {
                decrement: item_price
            }
        }
    });
    const delete_item = await item.delete({
        where: {
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
