
import mongoose from 'mongoose'
import {validateUser} from "./Mutation"
const findGroup=async (mongo,id)=>{
  const group=await mongo.GroupModel.findOne({_id:mongoose.Types.ObjectId(id)})
  if(group){
    return [group,"found"]
  }
  return [undefined,"group not found"]
}
export const findWebsite=async (mongo,url,needpublic)=>{
  const website=await mongo.WebsiteModel.findOne({url:url})
  if(website){
    if(needpublic){
      const website_with_comments=await website.populate("comments").execPopulate();
      console.log(website_with_comments)
      return [website_with_comments,"exist"]
    } 
    
    return [website,"exist"]
  }else{
    return[undefined,"not_exist"]
  }
}
export const validateWebsite=async(mongo,url)=>{
  const [website,msg]=await findWebsite(mongo,url,false)
  if(website)return website;
  else{
    console.log("new website")
    const newWebsite=new  mongo.WebsiteModel({url:url,comments:[],userranks:[],rank:0,totalStar:0,base:0}).save()
    if(newWebsite){
      
      return newWebsite
    }
  }
}
const Query = {
  async getWebsite(parent, {url}, { mongo }, info){
    const [website,msg]=await findWebsite(mongo,url,true);
    if(!website){
      return {id:"",url:url,comments:[],rank:0}
    }
    console.log(website)
    console.log(msg)
    return {id:website._id.toString(),url:website.url,comments:website.comments,rank:website.totalStar/(website.base+0.00000001)} ;
  },
  async getuser(parent, {name,password}, { mongo }, info) {
    let [user,msg]=await validateUser(mongo,name,password)
    if(!user)return {msg}
    console.log(user)
    const user_with_group= await user.populate('groups').populate('messages').execPopulate()
    console.log(user_with_group)
    const reuser={
      data:{
        id:user_with_group._id.toString(),
        name:user_with_group.name,
        password:user_with_group.password,
        friends:user_with_group.friends,
        tags:user_with_group.tags,
        groups:user_with_group.groups,
        messages:user_with_group.messages,
      },
      msg:"success"
    }
    return  reuser
  },
  async getgroup(parent, {user,password,id}, { mongo }, info) {
    const  [existuser,msg]=await validateUser(mongo,user,password)
    if(!existuser)return {msg}
    const [existgroup,gmsg]=await findGroup(mongo,id)
    if(!existgroup)return{msg:gmsg}
    const findid =existuser.groups.find((id)=>(id==existgroup._id.toString())) 
    console.log(existgroup)
    const group_with_bookmark=await existgroup.populate('bookMarks').execPopulate()
    
    if(existgroup.privacy==false){
      
      return {data:group_with_bookmark,msg:"found"}
    }else{
      if(!findid)return{msg:"group is private"}
      return {data:group_with_bookmark,msg:"found"}
    }
    
    const reuser={
      data:{
        id:user_with_group._id.toString(),
        name:user_with_group.name,
        password:user_with_group.password,
        friends:user_with_group.friends,
        tags:user_with_group.tags,
        groups:user_with_group.groups,
      },
      msg:"success"
    }
    return  reuser
  },
  async allGroups(parent, args, { mongo }, info){
    const allgroups=  await mongo.GroupModel.find()
    let re=[]
    allgroups.forEach((ele)=>{if(!ele.privacy && ele.name.indexOf("(deleted)")==-1 )re.push(ele.name)})
    //const re=allgroups.map((ele)=>(ele.name))
    console.log(re)
    return re
  },
  async allUsers(parent, args, { mongo }, info){
    const allusers=await mongo.UserModel.find()
    const re=allusers.map((ele)=>(ele.name))
    console.log(re)
    return re
  },
  async finduser(parent, {name, type}, { mongo }, info){
    const existuser =await mongo.UserModel.findOne({name});
    if(!existuser)return {msg:"user not found"} 
    const user_with_group= await existuser.populate('groups').execPopulate()
    let allGroup=[]
    let publicGroup=[]
    switch(type){
      case "all":{
        user_with_group.groups.forEach((g)=>{allGroup.push(g)})
        break
      }
      case "public":{
        user_with_group.groups.forEach((g)=>{if(!g.privacy){publicGroup.push(g)}})
        break
      }
      default:{ }
    }
    const reuser={
      data:{
        id:user_with_group._id.toString(),
        name:user_with_group.name,
        password:"",
        friends:[],
        tags:[],
        groups:type==="all"?allGroup:type==="public"?publicGroup:publicGroup,
        messages:[],
      },
      msg:"success"
    }
    return reuser

  },
  async findGroups(parent, {name}, { mongo }, info){
    const existgroup =await mongo.GroupModel.find({name});
    let publicgroups= []
    existgroup.forEach((g)=>{if(!g.privacy){publicgroups.push(g)}})
    return publicgroups
  },
  posts(parent, args, { db }, info) {
    if (!args.query) {
      return db.posts;
    }

    return db.posts.filter((post) => {
      const isTitleMatch = post.title
        .toLowerCase()
        .includes(args.query.toLowerCase());
      const isBodyMatch = post.body
        .toLowerCase()
        .includes(args.query.toLowerCase());
      return isTitleMatch || isBodyMatch;
    });
  },
  comments(parent, args, { db }, info) {
    return db.comments;
  },
  me() {
    return {
      id: '123098',
      name: 'Mike',
      email: 'mike@example.com',
    };
  },
  post() {
    return {
      id: '092',
      title: 'GraphQL 101',
      body: '',
      published: false,
    };
  },
};

export { Query as default };
