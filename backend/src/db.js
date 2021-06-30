
const mongoose = require('mongoose');
const dotenv =require('dotenv-defaults')

//const mongo = require('./mongo');
dotenv.config();

if (!process.env.MONGO_URL) {
console.log(process.env.MONGO_URL)
  console.error('Missing MONGO_URL!!!')
  process.exit(1)
}
else{
  console.log(process.env.MONGO_URL)
}
function connectMongo() {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log('Mongo database connected!');
  });
}

const mongo = {
  connect: connectMongo,
};

const { Schema } = mongoose;
/*
const userSchema = new Schema({
  name: { type: String, required: true },
  chatBoxes: [{ type: mongoose.Types.ObjectId, ref: 'ChatBox' }],
});*/
const bookMarkSchema =new Schema({
  name:{type:String,required:true},
  tags:[{type:String}],
  url:{type:String,required:true},
  createTime:{type:Number,required:true},
  userDefineRouting:[{type: mongoose.Types.ObjectId, ref: 'BookMark'}]
})
const groupSchema =new Schema({
  name:{type:String,required:true},
  users:[{type:String}],
  privacy:{type:Boolean,required:true},
  tags:[{type:String}],
  bookMarks:[{type: mongoose.Types.ObjectId,ref: 'BookMark'}]
})
const userSchema=new Schema({
  name:{type:String,required:true},
  password:{type:String,required:true},
  tags:[{type:String}],
  friends:[{type:mongoose.Types.ObjectId,ref:'User'}],
  messages:[{type:mongoose.Types.ObjectId,ref:'Message'}],
  groups:[{type:mongoose.Types.ObjectId,ref:'Group'}]
})

const messageSchema = new Schema({
  createTime:{type:Number,required:true},
  type:{type:String,required:true},
  sender_id: { type:String ,required:true},
  receiver_id:{type:String ,required:true},
  contain: { type: String, required: true },
});
const websiteSchema =new Schema({
  url:{type:String,required:true},
  comments:[{type:mongoose.Types.ObjectId,ref:'Message'}],
  userranks:[{type:String}],
  ranking:Number,
  totalStar:Number,
  base:Number
})

const chatBoxSchema = new Schema({
  name: { type: String, required: true },
  users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Types.ObjectId, ref: 'Message' }],
});
mongo.GroupModel=mongoose.model('Group', groupSchema);
mongo.BookMarkModel=mongoose.model('BookMark', bookMarkSchema);
mongo.UserModel = mongoose.model('User', userSchema);
mongo.ChatBoxModel = mongoose.model('ChatBox', chatBoxSchema);
mongo.MessageModel = mongoose.model('Message', messageSchema);
mongo.WebsiteModel=mongoose.model('Website',websiteSchema);

const users = [
  {
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27,
  },
  {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com',
  },
  {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com',
  },
];

const posts = [
  {
    id: '10',
    title: 'GraphQL 101',
    body: 'This is how to use GraphQL...',
    published: true,
    author: '1',
  },
  {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQL post...',
    published: false,
    author: '1',
  },
  {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: true,
    author: '2',
  },
];

const comments = [
  {
    id: '102',
    text: 'This worked well for me. Thanks!',
    author: '3',
    post: '10',
  },
  {
    id: '103',
    text: 'Glad you enjoyed it.',
    author: '1',
    post: '10',
  },
  {
    id: '104',
    text: 'This did no work.',
    author: '2',
    post: '11',
  },
  {
    id: '105',
    text: 'Nevermind. I got it to work.',
    author: '1',
    post: '12',
  },
];

const db = {
  users,
  posts,
  comments,
};

export { db ,mongo };
