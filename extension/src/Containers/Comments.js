/*global chrome*/
import React, { useState, useEffect, useContext } from 'react';
import { Row, Input, Space, Button, Rate, Avatar, message, Tooltip } from 'antd';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { AlignLeftOutlined, UserOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';

import '../App.css';
import { QueryGetWebsite, createComment, rankwebsite } from '../graphql'
import CommentRender from '../Components/CommentRender'
import { UserDataContext } from '../App.js'

const { TextArea } = Input;

const Comments = ({ handleHomePageClick, checkLogin, handleLogout }) => {
  // context
  const userData = useContext(UserDataContext)

  // comments own
  const [ url, setUrl ] = useState('https://ceiba.ntu.edu.tw/')
  const [ messageState, setMessageState] = useState('blur')
  const [ message_type, setMessage ] = useState('')
  const [ messagesList, setMessagesList ] = useState([])
  const [ rank, setRank ] = useState(0)
  const [ rate, setRate ] = useState(0)

  // backend
  const { data: getWebsiteData, refetch: refetchWebsite } = useQuery(QueryGetWebsite, {variables:{url: url}})
  const [addComment, { data: getComment }] = useMutation(createComment);
  const [addRank, { data: getRank }] = useMutation(rankwebsite);

  // chrome api
  useEffect(() => {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      setUrl(tabs[0].url)
    });
  },[])

  useEffect(() => {
    if (getWebsiteData !== undefined) {
      if (getWebsiteData.getWebsite.comments !== null) {
        var copyComments = [...getWebsiteData.getWebsite.comments]
        var tidyComment = commentDisplay(copyComments)
        setMessagesList(tidyComment)
        setRank(Math.round(getWebsiteData.getWebsite.rank * 10) / 10)
        setRate(Math.round(getWebsiteData.getWebsite.rank * 10) / 10)
      }
    }
  },[getWebsiteData])

  useEffect(() => {
    if (getComment !== undefined) {
      if (getComment.addComment.msg === 'add success') {
        message.success('Comment success')
        setMessage('')
        refetchWebsite()
      }
    }
  },[getComment])

  useEffect(() => {
    if (getRank !== undefined) {
      refetchWebsite()
    }
  },[getRank])

  const handleMessage = (e) => {
    if (e.type === 'click' && checkLogin(userData.name, userData.password)) {
      setMessageState(e.type)
    }
    if (e.type === 'change') {
      setMessage(e.target.value)
    }
    setMessageState(e.type)
  }

  const commentDisplay = (rawComment) => {
    rawComment = rawComment.reverse()
    var tidyComment = []
    var parentComment = rawComment.filter(comment => comment.receiver_id === 'no')
    var childrenComment = rawComment.filter(comment => comment.receiver_id !== 'no')
    for(let i = 0; i < parentComment.length; i++) {
      var childrenComment_i = childrenComment.filter(comment => comment.receiver_id === parentComment[i].id)
      var comment_i = {
        parent: parentComment[i],
        children: childrenComment_i
      }
      tidyComment.push(comment_i)
    }
    return tidyComment
  }

  const handleSortClick = () => {
    console.log('sort');
  }

  const handleComment = (receiver_id, contain) => {
    addComment({
      variables: {
        user: userData.name,
        password: userData.password,
        contain: contain,
        receiver_id: receiver_id,
        url: url
      }
    })
  }

  const handleRate = (rank) => {
    setRate(rank)
    addRank({
      variables: {
        user: userData.name,
        password: userData.password,
        rank: rank,
        url: url
      }
    })
  }

  const scrollBar = () => {
    return (
      <InfiniteScroll
        pageStart={0}
        hasMore={true || false}
      >
        <Row>
          <Space>
            <Avatar icon={userData.name === 'Jonathan' ? <img src='/images/jonathan.jpg' alt='jonathan'></img>  : <UserOutlined />} onClick={handleHomePageClick}/>
            <TextArea
              id="comment-input"
              placeholder={userData.name === undefined ? "Login first to comment" :"Add a public comment..."}
              value={message_type}
              autoSize={{ minRows: 1, maxRows: 4 }}
              onFocus={handleMessage}
              onBlur={handleMessage}
              onChange={handleMessage}
              onClick={handleMessage}
            />
          </Space>
        </Row>
        {messageState === 'blur' && message_type === ''
          ? null
          : (<Row justify="end" style={{marginTop: 4, marginRight: 14}}>
              <Space>
                <Button type='text' size='middle' onClick={() => {setMessageState('blur')}}>cancel</Button>
                {message_type === ''
                  ? (<Button type="primary" size='middle' disabled>comment</Button>)
                  : (<Button type="primary" size='middle' onClick={() => {handleComment('no', message_type)}}>comment</Button>)
                }
              </Space>
            </Row>)
        }
        <Row>
          { messagesList.map(message => {
              return (<CommentRender 
                        key={message.parent.id} 
                        message={message} 
                        handleComment={handleComment}
                        checkLogin={checkLogin}
                      ></CommentRender>)
            })}
        </Row>
      </InfiniteScroll>
    )
  }

  return (
    <div className="App-comments">
      <Space direction="vertical" style={{width: 250, height:180}}>
        <Row justify="end" className="App-rate">
          <Space>
            {rank === 0
              ? (<p style={{margin: 0, fontSize: 12}}>Be the first to rate!</p>)
              : (<h3 style={{margin: 0}}>{rank}</h3>)
            }
            <Rate value={rate} onChange={handleRate}></Rate>
          </Space>
        </Row>
        <div>
          <Space style={{float: 'left'}}>
            <label>{ messagesList.length } comments</label>
            <AlignLeftOutlined onClick={handleSortClick}/>
          </Space>
          {userData.name === undefined
            ? ( <Space style={{float: 'right'}}>
                  <Tooltip placement="topLeft" title={'Login'}>
                    <Button
                      type="circle"
                      size='small'
                      icon={<LoginOutlined />}
                      onClick={checkLogin}
                    >
                    </Button>
                  </Tooltip>
                </Space>)
            : ( <Space style={{float: 'right'}}>
                  <label>{ userData.name }</label>
                  <Tooltip placement="topLeft" title={'Log out'}>
                    <Button
                      type="circle"
                      size='small'
                      icon={<LogoutOutlined />}
                      onClick={handleLogout}
                    >
                    </Button>
                  </Tooltip>
              </Space>)
          }
        </div>
        <Row className="App-comments-scroller-container">
          {scrollBar()}
        </Row>
      </Space>
    </div>
      )
}

      export default Comments