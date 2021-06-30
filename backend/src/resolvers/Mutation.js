import uuidv4 from 'uuid/v4';
import mongoose from 'mongoose'
import {findWebsite ,validateWebsite} from "./Query"
import moment from 'moment'
const time=1541497385;
const accesstype={owner_access:3,editor_access:2,viewer_access:1,cant_access:0}


export const validateUser=async (mongo,name,password)=>{
  
  const existing = await mongo.UserModel.findOne({ name });
  if (existing) {
    if(existing.password==password){
      return [existing,"exist"]
    }
    return [undefined,"wrong_password"]
  }
  return [undefined,"not_exist"];
  
}

const newUser=async(mongo,name,password)=>{
  const user=await new mongo.UserModel({name,password,tags:[],friends:[],groups:[],messages:[]}).save()
  return user
}
const makeName = (name, to) => {
  return [name, to].sort().join('_');
};
const validateChatBox = async (mongo,name, participants) => {
  let box = await mongo.ChatBoxModel.findOne({ name });
  if (!box) box = await new mongo.ChatBoxModel({ name, users: participants }).save();
  return box
    .populate('users')
    .populate({ path: 'messages', populate: 'sender' })
    .execPopulate();
};
const oneBookMark=async(mongo,name,url,groupid,user,password,tags)=>{
  //let bookMark=await mongo.findOne({})
  const [existuser,msg]=await validateUser(mongo,user,password)
  if(!existuser)return[undefined,msg]
  console.log("check user")
  const [existgroup,access]=await validateGroupAccess(mongo,groupid,user)
  if(!existgroup)return [undefined,"group not exist"]
  console.log("check group"+access)
  if(access<accesstype.editor_access)return[undefined,"access fail you are not editor"]
  let tmp
  if(tags){
    await tags.forEach(async element => {
      if(!existgroup.tags.find((tag)=>(tag==element))){ 
        tmp=await mongo.GroupModel.updateOne({_id:existgroup._id},{ $push: { tags:element  } })
      }
      return 
    });
    tags.forEach((t)=>{name=name+"@"+t})
  }
  //console.log(name)
  
  const bookMark= await new mongo.BookMarkModel({name,url,createTime:moment().format("X")-time,tags:[]}).save()
  let  group=await mongo.GroupModel.updateOne({_id:mongoose.Types.ObjectId(groupid)},{ $push: { bookMarks: bookMark } })
      
  return [bookMark,"create_success"]
   
}

const validateGroup=async(mongo,name,privacy,InitUser,password)=>{
  const [existuser,msg]=await validateUser(mongo,InitUser,password)
  if (existuser){
    let  group= await new mongo.GroupModel({name,privacy,users:[InitUser+"#owner"],bookMarks:[],tags:[]}).save()
    await mongo.UserModel.updateOne({_id:existuser._id},{ $push: { groups: group } })
    return [group,msg];
  }else{
    return [undefined,msg]
  }
}
const validateGroupAccess=async(mongo,groupid,user_name)=>{
  const existGroup=await mongo.GroupModel.findOne({_id:mongoose.Types.ObjectId(groupid)})
  if(!existGroup)return [undefined,0]
  const alluser =existGroup.users
  if(alluser.find((oneuser)=>(oneuser==user_name+"#owner")))return [existGroup,3]
  else if(alluser.find((oneuser)=>(oneuser==user_name+"#editor")))return [existGroup,2]
  else if(!existGroup.privacy) return [existGroup,1]
  else return [undefined,0]
}
const findMessage=async(mongo,messageid)=>{
  const message=await mongo.MessageModel.findOne({_id:mongoose.Types.ObjectId(messageid)})
  if(message){
    return [message,"found"]
  }
  return [undefined,"reply message not exist"]
}
const findUser=async(mongo,name)=>{
  const user=await mongo.UserModel.findOne({ name });
  if(user)return[user,"found"]
  else return[undefined,"user not found"]
}

const Mutation = {
  async createBookMarks(parent, {data}, { mongo }, info){
    console.log(data);
    
    const [newBookMark,msg]=await oneBookMark(mongo,data.name,data.url,data.groupid,data.user,data.password,data.tags)
    if(!newBookMark){
      return{
        msg
      }
    }
    console.log(newBookMark)
    let rebookmark={data:{
      tags:newBookMark.tags,
      name:newBookMark.name,
      url:newBookMark.url,
      createTime:newBookMark.createTime,
      id:newBookMark._id.toString()
    },msg:"create new"}
    return rebookmark
    console.log(rebookmark)
    
  },
  async removeBookMarks (parent, {user,password,group_id,bookMark_id}, { mongo }, info){
    const [existuser,msg]=await validateUser(mongo,user,password)
    if(!existuser)return{msg}
    console.log("check user")
    const [existgroup,access]=await validateGroupAccess(mongo,group_id,user)
    if(access<accesstype.editor_access)return {msg:"you are not editor"}
    const bookmarkID=mongoose.Types.ObjectId(bookMark_id)
    await mongo.GroupModel.updateOne({_id:existgroup._id}, { $pull: { bookMarks: bookmarkID }})
    const bookMark_removed =await mongo.BookMarkModel.deleteOne({_id:bookmarkID})
    return {data:bookMark_removed,msg:"delete success"}
    //if(!existgroup)return [undefined,"group not exist"]

  },
  async createGroup(parent, {data}, { mongo }, info){
    console.log(data);
    const [newGroup,msg]=await validateGroup(mongo,data.name,data.privacy,data.user,data.password);
    console.log(newGroup);
    if(!newGroup){
      return {msg}
    }
    const reGroup={data:{
      id:newGroup._id.toString(),
      name:newGroup.name,
      users:newGroup.users,
      bookMarks:newGroup.bookMarks,
      privacy:newGroup.privacy
    },msg:"create new"}
    return reGroup;
    
  },
  async createUser(parent, {data}, { mongo }, info){
    console.log(data);
    const [existuser,msg]=await validateUser(mongo,data.name,data.password) 
    if(msg!="not_exist"){
      return{
        msg:"user already exist"
      }
    }else{
      const NewUser=await newUser(mongo,data.name,data.password);
      const reuser={
        data:{
          id:NewUser._id.toString(),
          name:NewUser.name,
          password:NewUser.password,
          friends:NewUser.friends,
          tags:NewUser.tags,
          groups:NewUser.groups,
          messages:NewUser.messages
        },
        msg:"success"
      }
      return reuser
    }
  },
  async addComment(parent, {user,password,contain,receiver_id,url}, { mongo }, info){
      let recive_user  
      contain=user+"#@#"+contain 
      const [existuser,user_msg]=await validateUser(mongo,user,password);
      if(existuser){
        if(receiver_id!="no"){
            const [reply,reply_msg]=await findMessage(mongo,receiver_id)
            if(!reply){
              return {msg:reply_msg}
            }
            
            recive_user=await mongo.UserModel.findOne({ _id:mongoose.Types.ObjectId(reply.sender_id) })
            if(!recive_user){return {msg:"error reply user  not exist"}}
            contain=contain+"#@#"+reply.contain
        }else{
          const reply=undefined;
        }
        
 
        const existWebsite=await validateWebsite(mongo,url);
        const commentMessage=await new mongo.MessageModel({type:"url#"+url,contain,
        sender_id:existuser._id.toString(),receiver_id,createTime:moment().format("X")-time}).save()
        await mongo.WebsiteModel.updateOne({_id:existWebsite._id},{ $push: { comments: commentMessage } })
        if(recive_user){
          await mongo.UserModel.updateOne({_id:recive_user._id},{ $push: { messages: commentMessage }} )
        }
        
        return {data:commentMessage,msg:"add success"}
      }
      return {msg:user_msg}
  },
  async inviteToGroup(parent, {user,password,group_id,receiverName}, { mongo }, info){
      const [existuser,user_msg]=await validateUser(mongo,user,password)
      if(!existuser)return {msg:user_msg}
      const [existGroup,access]=await validateGroupAccess(mongo,group_id,existuser.name)
      if (access!=accesstype.owner_access)return{msg:"you are not owner of group"}
      const [existReceiver,re_msg]=await findUser(mongo,receiverName)
      if(!existReceiver)return {msg:re_msg}
      const inviteMsg= await new mongo.MessageModel({
        type:"group_invite",contain:user+" invite you to join "+existGroup.name+" as editor",
        sender_id:existGroup._id.toString(),receiver_id:existReceiver._id.toString(),createTime:moment().format("X")-time
      }).save()
      await mongo.UserModel.updateOne({_id:existReceiver._id},{ $push: { messages: inviteMsg } })
      return{
        data:inviteMsg,
        msg:"invite send"
      }
  },
  async acceptInvite(parent, {user,password,message_id}, { mongo }, info){
    const [existuser,user_msg]=await validateUser(mongo,user,password)
    if(!existuser)return {msg:user_msg}
    const [existMessage,msg]=await findMessage(mongo,message_id)
    if(!existMessage)return{msg}
    if(existMessage.type!="group_invite")return{msg:"this is not invite message"}
    const existgroup=await mongo.GroupModel.findOne({_id:mongoose.Types.ObjectId(existMessage.sender_id)})
    if(!existgroup)return {msg:"group no longer exist"}
    if(existgroup.users.find((usr)=>(usr==user+"#owner" || usr==user+"#editor")))return {msg:"group aready in your group list"}
    await mongo.GroupModel.updateOne({_id:existgroup._id},{ $push: { users:  user+"#editor"}})
    await mongo.UserModel.updateOne({_id:existuser._id},{ $push: { groups:  existgroup}})
    return {data:existMessage,msg:"you accept this invite successfully"}
  },
  async subscribeGroup(parent, {user,password,group_id}, { mongo }, info){
    const [existuser,user_msg]=await validateUser(mongo,user,password)
    if(!existuser)return {msg:user_msg}
    const [existGroup,access]=await validateGroupAccess(mongo,group_id,existuser.name)
    if (access<accesstype.viewer_access)return{msg:"group is private"}
    if(existuser.groups.find((id)=>(id.toString()==group_id)))return {msg:"group aready in your group list"}
    await mongo.UserModel.updateOne({_id:existuser._id},{ $push: { groups:  existGroup}})
    return {data:existGroup,msg:"subscribe success"}
  },
  async unsubscribeGroup(parent, {user,password,group_id}, { mongo }, info){
    const [existuser,user_msg]=await validateUser(mongo,user,password)
    if(!existuser)return {msg:user_msg}
    const [existGroup,access]=await validateGroupAccess(mongo,group_id,existuser.name)
    if(access<accesstype.viewer_access)return{msg:"you don't have this group ,nothing to remove"}
    if(access==accesstype.editor_access){
      await mongo.GroupModel.updateOne({_id:existGroup._id}, { $pull: { users: user+"#editor" }})
    }else if(access==accesstype.owner_access){
      await mongo.GroupModel.updateOne({_id:existGroup._id}, { $set: { users:[],bookMarks:[],name:existGroup.name+"(deleted)",privacy:false}})
       //return {msg:"temporary we don't suppoert owner delete group"}
    }
    await mongo.UserModel.updateOne({_id:existuser._id}, { $pull: { groups: existGroup._id }})
    return {data:existGroup,msg:"unsubscribeGroup success"}
  },
  async removeMessage(parent, {user,password,message_id}, { mongo }, info){
    const [existuser,user_msg]=await validateUser(mongo,user,password)
    if(!existuser)return {msg:user_msg}
    const mid= mongoose.Types.ObjectId(message_id)
    await mongo.UserModel.updateOne({_id:existuser._id}, { $pull: { messages: mid}})
    await mongo.UserModel.deleteOne({_id:mid})
    return {msg:"remove success"}
  },
  async rankwebsite(parent, {user,password,url,rank}, { mongo }, info){
    if(rank>5 ||rank<0 )return{msg:"rank should within 0-5"}
    const [existuser,user_msg]=await validateUser(mongo,user,password);
    if(!existuser)return {msg:user_msg}
    const existWebsite=await validateWebsite(mongo,url);
    let found=-1;


    for(let i=0;i<6;i++){
      if(existWebsite.userranks.find((ele)=>(ele==user+"#"+i))){
        found=i;
        break;
      }
    }
    console.log(existWebsite);
    if(found ==-1){
      await mongo.WebsiteModel.updateOne({_id:existWebsite._id},{$set :{totalStar:existWebsite.totalStar+rank,base:existWebsite.base+1}})
      await mongo.WebsiteModel.updateOne({_id:existWebsite._id},{$push:{userranks:user+"#"+rank}  })
      return {
        msg:"new"
      }
    }else{
      await mongo.WebsiteModel.updateOne({_id:existWebsite._id},{$set :{totalStar:existWebsite.totalStar+rank-found}})
      await mongo.WebsiteModel.updateOne({_id:existWebsite._id},{$pull:{userranks:user+"#"+found} })
      await mongo.WebsiteModel.updateOne({_id:existWebsite._id},{$push:{userranks:user+"#"+rank} })
      
      return {
        msg:"update"
      }

    }
  },

  

  async createChatBox(parent, {name1,name2}, { mongo }, info){
    {
      if (!name1 || !name2)
        throw new Error
        ("Missing chatBox name for CreateChatBox");
      const chatBoxName = makeName(name1, name2);
      const sender=await validateUser(mongo,name1,"createChatBox");
      const receiver=await validateUser(mongo,name2,"createChatBox");
      const chatBox = await validateChatBox(mongo,chatBoxName, [sender, receiver]);
      console.log(sender);
      console.log(receiver);
      //console.log(chatBox);
      return {
        id:uuidv4(),
        name:chatBoxName,
        messages: chatBox.messages.map(({ sender: { name }, body }) => ({
          name,
          body,
        })),
      }
    }
  
  },
  async  createMessage(parent, {name1,name2,msg}, { mongo,pubsub }, info){
    console.log("test:"+name1+"_"+name2+"-"+msg)
    const chatBoxName = makeName(name1, name2);
    const sender=await validateUser(mongo,name1,"createChatBox");
    console.log("save2")
    const receiver=await validateUser(mongo,name2,"createChatBox");
    const chatBox = await validateChatBox(mongo,chatBoxName, [sender, receiver]);
    const newMessage = new mongo.MessageModel({ sender,body:msg });
    console.log("save1")
    await newMessage.save();
    console.log("save3")
    chatBox.messages.push(newMessage);
    await chatBox.save();
    console.log("save")
    const message = {
      name:name1,
      body:msg
    };
    pubsub.publish('message-'+chatBoxName, {
      message: {
        mutation: 'CREATED',
        data:message
      },
    });
    return message;


  },
  
  deleteUser(parent, args, { db }, info) {
    const userIndex = db.users.findIndex((user) => user.id === args.id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletedUsers = db.users.splice(userIndex, 1);

    db.posts = db.posts.filter((post) => {
      const match = post.author === args.id;

      if (match) {
        db.comments = db.comments.filter((comment) => comment.post !== post.id);
      }

      return !match;
    });
    db.comments = db.comments.filter((comment) => comment.author !== args.id);

    return deletedUsers[0];
  },
  updateUser(parent, args, { db }, info) {
    const { id, data } = args;
    const user = db.users.find((user) => user.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    if (typeof data.email === 'string') {
      const emailTaken = db.users.some((user) => user.email === data.email);

      if (emailTaken) {
        throw new Error('Email taken');
      }

      user.email = data.email;
    }

    if (typeof data.name === 'string') {
      user.name = data.name;
    }

    if (typeof data.age !== 'undefined') {
      user.age = data.age;
    }

    return user;
  },
  createPost(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some((user) => user.id === args.data.author);

    if (!userExists) {
      throw new Error('User not found');
    }

    const post = {
      id: uuidv4(),
      ...args.data,
    };

    db.posts.unshift(post);

    if (args.data.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post,
        },
      });
    }

    return post;
  },
  deletePost(parent, args, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex((post) => post.id === args.id);

    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const [post] = db.posts.splice(postIndex, 1);

    db.comments = db.comments.filter((comment) => comment.post !== args.id);

    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post,
        },
      });
    }

    return post;
  },
  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const post = db.posts.find((post) => post.id === id);
    const originalPost = { ...post };

    if (!post) {
      throw new Error('Post not found');
    }

    if (typeof data.title === 'string') {
      post.title = data.title;
    }

    if (typeof data.body === 'string') {
      post.body = data.body;
    }

    if (typeof data.published === 'boolean') {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost,
          },
        });
      } else if (!originalPost.published && post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post,
          },
        });
      }
    } else if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post,
        },
      });
    }

    return post;
  },
  createComment(parent, args, { db, pubsub }, info) {
    const userExists = db.users.some((user) => user.id === args.data.author);
    const postExists = db.posts.some(
      (post) => post.id === args.data.post && post.published,
    );

    if (!userExists || !postExists) {
      throw new Error('Unable to find user and post');
    }

    const comment = {
      id: uuidv4(),
      ...args.data,
    };

    db.comments.push(comment);
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment,
      },
    });

    return comment;
  },
  deleteComment(parent, args, { db, pubsub }, info) {
    const commentIndex = db.comments.findIndex(
      (comment) => comment.id === args.id,
    );

    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const [deletedComment] = db.comments.splice(commentIndex, 1);
    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment,
      },
    });

    return deletedComment;
  },
  updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const comment = db.comments.find((comment) => comment.id === id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (typeof data.text === 'string') {
      comment.text = data.text;
    }

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment,
      },
    });

    return comment;
  },
};

export { Mutation as default };
