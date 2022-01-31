
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { order, item } = new PrismaClient();
router.get('',async(req,res)=>{ // Find all order of user by category
    // @ts-ignore
    const user_id = String(req.query['user_id']), start_date = new Date(req.query['start_date']), end_date = new Date(req.query['end_date']);
    if(!user_id){
        return res.status(203).json({'msg':'Not logged in.'});
    }
    const category = ['Keyboard','Keycap','Switches','Artisan','Misc'];
    const find_order = await order.findMany({
        where: {
            user_id,
            date_of_purchase:{
                gte: start_date,
                lte: end_date
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
            }
        });
        list.push(...items);
    }
    for(let i = 0; i < find_order.length;i++)
        await get_items(find_order[i].order_id);
    return res.status(200).json(list);
});
module.exports = router;

/*
Get Items by category and date (using navbar)
*/