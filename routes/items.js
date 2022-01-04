const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { order, item } = new PrismaClient();
router.get('',async(req,res)=>{ // Find all order of user by category
    const {user_id, category, active} = req.body;
    const past = (active) ? 'gt' : 'lt';
    if(!user_id){
        res.status(203).json({'msg':'Not logged in.'});
    }
    const find_order = await order.findMany({
        where: {
            user_id: user_id,
            arrival_date: {
                [past]: new Date()
            }
		},
        select:{
            order_id: true
        }
    });
    let list = [];
    const get_items = async (order_id) => {
        const items = await item.findMany({
            where:{
                order_id: order_id,
                category: category
            }
        });
        list.push(...items);
    }
    for(let i = 0; i < find_order.length;i++)
        await get_items(find_order[i].order_id);
    res.status(200).json(list);
});
module.exports = router;

/*
Get Items by category and date (using navbar)
*/