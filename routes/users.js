const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();
let bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(8);

router.get("", async (req, res) => {
	try {
		const users = await user.findMany({
			orderBy:{
				createdAt: 'desc'
			}
		});
		return res.json(users);
	} catch (err) {
		console.log(err);
		return res.status(500).json(err);
	}
});
const capitalize = (str) =>{
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}
router.post("/sign_up", async (req, res) => {
    let {first_name, last_name, username, password, email, pfp} = req.body;
    
    let checkFor = [
		{ prop: "username", value: username },
		{ prop: "email", value: email },
	];
    const userExists = await function (item) {
		let res = user.findFirst({
			where: {
				[item.prop]: item.value,
			},
		});
		return res;
	};
    for (let field of checkFor) {
		if (await userExists(field)) {
            // check if username and email is unique
			return res.status(203).json({
				msg: `${field.value}: is already taken/used`,
			});
		}
	}
    first_name = capitalize(first_name);
    last_name = capitalize(last_name);
    password = bcrypt.hashSync(password, salt);
    const createUser = await user.create({
        data:{
            username,
            password,
            first_name,
            last_name,
            email,
            pfp,
        }
    });
    return res.json(createUser);
});
const updateInfo = (user) =>{
	return {
		'username':user.username,
		'first_name':user.first_name,
		'last_name':user.last_name,
		'email':user.email,
		'user_id':user.user_id
	};
}
function login(user,req){
	let userInfo = updateInfo(user);
	return {'msg':"Logged in successfully.",userInfo};
}
router.post('/login', async(req,res)=>{
    let { user_identification, password } = req.body;
	const users = await user.findFirst({
		where: {
			OR: [{ email: user_identification }, { username: user_identification }],
		},
	});
	if(!users) return res.status(203).json({ 'msg': "Username/email is not found" });
	password = bcrypt.compareSync(password,users.password);
	if(password){
		return res.status(200).json(login(users,req));
	}else return res.status(203).json({'msg':'Incorrect password'});
});
module.exports = router;
