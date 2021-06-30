const ChatBox = {
    name(parent, args, { mongo }, info){
        console.log("name!!!!!!")
        return parent.name
    },
    messages(parent, args, { mongo }, info) {
        console.log(parent)
        console.log("messagessssss")
        return parent.messages
        /*
      return Promise.all(
        parent.messages.map((mId) => 
        mongo.MessageModel.findById(mId)),
      );*/
    },
  };
  
  export default ChatBox;