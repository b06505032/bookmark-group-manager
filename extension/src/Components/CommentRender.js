import React, { createElement, useState, useContext } from 'react';
import { Comment, Tooltip, Avatar, Space, Input, Button, Row } from 'antd';
import moment from 'moment';
import { DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled, UserOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { UserDataContext } from '../App.js'

const constTime = 1541497385

const CommentRender = ({ message, handleComment, checkLogin }) => {
  // context
  const userData = useContext(UserDataContext)

  // comment render own
  const [ sender, setSender ] = useState('')
  const [ time, setTime ] = useState(0)
  const [ comment, setComment ] = useState('')
  const [ replyComments, setReplyComment ] = useState([])
  const [ hideReply, setHideReply ] = useState(true)

  // reply message
  const [ replyStatus, setReplyStatus ] = useState('blur')
  const [ replyMessage, setReplyMessage ] = useState('')

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState(null);

  useState(() => {
    const parentComment = message.parent
    const childrenComment = message.children
    setSender(parentComment.contain.split('#@#')[0])
    setComment(parentComment.contain.split('#@#')[1])
    setTime(parseInt((parentComment.createTime + constTime) + '000'))
    setReplyComment(childrenComment.reverse())
  },[message])

  const like = () => {
    if(checkLogin(userData.name, userData.password)) {
      setLikes(1);
      setDislikes(0);
      setAction('liked');
    }
  };

  const dislike = () => {
    if(checkLogin(userData.name, userData.password)) {
      setLikes(0);
      setDislikes(1);
      setAction('disliked');
    }
  };

  const hanleSubComment = () => {
    handleComment(message.parent.id, replyMessage); 
    const newReplyComment = {
      contain: userData.name + '#@#' + replyMessage,
      createTime: moment().format('X') - constTime
    }
    setReplyComment((replyComments) => [...replyComments, newReplyComment])
    setReplyStatus('blur');
    setReplyMessage('')
  }


  const actions = [
    <Tooltip key="comment-basic-like" title="Like" style={{marginTop: 0}}>
      <span onClick={like}>
        {createElement(action === 'liked' ? LikeFilled : LikeOutlined)}
        <span className="comment-action">{likes}</span>
      </span>
    </Tooltip>,
    <Tooltip key="comment-basic-dislike" title="Dislike">
      <span onClick={dislike}>
        {React.createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined)}
        <span className="comment-action">{dislikes}</span>
      </span>
    </Tooltip>,
    <span 
      key="comment-basic-reply-to" 
      onClick={() => {
        if(checkLogin(userData.name, userData.password)) {
          setReplyStatus('focus')
        }
      }}>Reply to</span>,
    <div>
      {replyStatus === 'blur'
        ? null
        : (<div>
              <Space>
              <Avatar
                // size='small'
                icon={userData.name === 'Jonathan' ? 
                      <img src='/images/jonathan.jpg' alt='jonathan'/> : 
                      userData.name === 'Catherine' ? 
                      <img src='/images/Catherine.jpg' alt='catherine'/> : 
                      userData.name === 'gordon' ? 
                      <img src='/images/gordon.jpg' alt='gordon'/> :
                      <UserOutlined />}
              />
                <Input
                  style={{width: 175}}
                  size='small'
                  id="comment-input"
                  placeholder={'reply to ' + sender + ' ...'}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </Space>
              <Row justify='end'>
                <Space>
                  <Button type='text' size='small' onClick={() => {setReplyStatus('blur')}}>cancel</Button>
                  {replyMessage === '' && userData.name !== undefined
                    ? (<Button type="primary" size='small' disabled>comment</Button>)
                    : (<Button 
                        type="primary" 
                        size='small' 
                        onClick={hanleSubComment}>
                          comment
                        </Button>)
                  }
                </Space>
              </Row>
            </div>)
      }
    </div>
  ];

  const reply_tree = (reply, index) => {
    return (
      <Comment
        key={index}
        className="App-comment"
        author={<a>{ reply.contain.split('#@#')[0] }</a>}
        avatar={
          <Avatar
            // size='small'
            icon={reply.contain.split('#@#')[0] === 'Jonathan' ? 
                  <img src='/images/jonathan.jpg' alt='jonathan'/> : 
                  reply.contain.split('#@#')[0] === 'Catherine' ? 
                  <img src='/images/Catherine.jpg' alt='catherine'/> : 
                  reply.contain.split('#@#')[0] === 'gordon' ? 
                  <img src='/images/gordon.jpg' alt='gordon'/> :
                  <UserOutlined />}
          />
        }
        content={
          <p style={{textAlign: "left"}}>
            { reply.contain.split('#@#')[1] }
          </p>
        }
        datetime={
        <Tooltip title={moment(parseInt((reply.createTime + constTime) + '000')).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{moment(parseInt((reply.createTime + constTime) + '000')).fromNow()}</span>
        </Tooltip>
      }
      ></Comment>
    )
  }

  return (
    <Comment
      className="App-comment"
      actions={actions}
      author={<a>{ sender }</a>}
      avatar={
        <Avatar
          icon={sender === 'Jonathan' ? 
            <img src='/images/jonathan.jpg' alt='jonathan'/> : 
            sender === 'Catherine' ? 
            <img src='/images/Catherine.jpg' alt='catherine'/> : 
            sender === 'gordon' ? 
            <img src='/images/gordon.jpg' alt='gordon'/> : 
            <UserOutlined />}
          alt="Han Solo"
        />
      }
      content={
        <p style={{textAlign: "left"}}>
          { comment }
        </p>
      }
      datetime={
        <Tooltip title={moment(time).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{moment(time).fromNow()}</span>
        </Tooltip>
      }
    >
      {replyComments.length === 0
        ? null
        : hideReply === true 
          ? ( <a onClick={() => {setHideReply(false)}} style={{fontSize: 13}}>
                <CaretDownOutlined/>
                {replyComments.length > 1
                  ? 'View ' + replyComments.length + ' replies'
                  : 'View reply'
                }
              </a> )
          : ( <div>
                <a onClick={() => {setHideReply(true)}} style={{fontSize: 13}}>
                  <CaretUpOutlined/>
                  {replyComments.length > 1
                    ? 'Hide ' + replyComments.length + ' replies'
                    : 'Hide reply'
                  }
                </a> 
                {replyComments.map((reply, index) => {
                  return reply_tree(reply, index)
                })}
              </div>)
      }   
    </Comment>
  );
};

export default CommentRender