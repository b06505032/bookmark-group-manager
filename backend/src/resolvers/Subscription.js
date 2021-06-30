const Subscription = {
  message:{
    subscribe(parent, { chatroom }, { mongo, pubsub }, info){
      console.log("subscription: "+chatroom)
      return pubsub.asyncIterator(`message-${chatroom}`);//
    }
  },
  comment: {
    subscribe(parent, { postId }, { db, pubsub }, info) {
      const post = db.posts.find(
        (post) => post.id === postId && post.published,
      );

      if (!post) {
        throw new Error('Post not found');
      }

      return pubsub.asyncIterator(`comment ${postId}`);
    },
  },
  post: {
    subscribe(parent, args, { pubsub }, info) {
      return pubsub.asyncIterator('post');
    },
  },
};

export { Subscription as default };
