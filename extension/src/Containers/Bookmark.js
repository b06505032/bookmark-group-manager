/*global chrome*/
import React, { useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Row, Input, Space, Button, Select, TreeSelect, message, Tooltip } from 'antd';
import {  CheckCircleTwoTone } from '@ant-design/icons';

import { UserDataContext } from '../App.js'
import { createBookMarks, removeBookMarks, createGroup, QueryGetGroup } from '../graphql'
import ChatModal from '../Components/AddGroupModal'
import '../App.css';

const { Option } = Select;
const { TreeNode } = TreeSelect;

const Bookmark = ({ handleHomePageClick, checkLogin, refetchUser }) => {
  // context
  const userData = useContext(UserDataContext)

  // bookmark own
  const [ url, setUrl ] = useState('https://test.com')
  const [ webTitle, setWebTitle ] = useState('Test')
  const [ selectTags, setSelectTags ] = useState([])
  const [ selectGroup, setSelectGroup ] = useState('')
  const [ selectGroupBookmark, setSelectGroupBookmar ] = useState({})
  const [ addGroupVisible, setAddGroupVisible ] = useState(false)

  // backend
  const [tagList, setTagList ] = useState([])
  const [GroupList, setGroupList ] = useState([])
  const [addBookMarks, { data: BookMarks }] = useMutation(createBookMarks);
  const [removeBookMark, { data: removeMsg }] = useMutation(removeBookMarks);
  const [addGroup, { data: Group }] = useMutation(createGroup);
  const { data: getGroup, refetch: refetchGroup } = useQuery(QueryGetGroup, {
    variables: {
      user: Object.keys(userData).length > 0 ? userData.name : '', 
      password: Object.keys(userData).length > 0 ? userData.password : '',
      id: selectGroup,
    }
  })

  // chrome api
  useEffect(() => {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      setUrl(tabs[0].url)
      setWebTitle(tabs[0].title)
    });
  },[])

  // backend
  useEffect(() => {
    if (Object.keys(userData).length !== 0) {
      if (selectGroup === '' && userData.groups.length !== 0) {
        setSelectGroup(userData.groups[0].id)
      }
      setGroupList(userData.groups)
      setTagList(userData.tags)
    } else {
      setSelectGroup('')
      setGroupList([])
      setTagList([])
    }
  },[userData])

  useEffect(() => {
    if (BookMarks !== undefined) {
      console.log(BookMarks);
      if (BookMarks.createBookMarks.data !== null) {
        message.success('Bookmark create success')
        refetchUser()
        refetchGroup()
      } else {
        message.error('Bookmark create fail');
      }
    }
  },[BookMarks, refetchUser])

  useEffect(() => {
    if (Group !== undefined) {
      console.log(Group);
      setAddGroupVisible(false)
      setSelectGroup(Group.createGroup.data.id)
      refetchUser()
    }
  },[Group, refetchUser])

  useEffect(() => {
    const groupId = GroupList.findIndex(group => group.id === selectGroup)
    if (groupId !== -1) {
      setTagList(GroupList[groupId].tags)
    }
  },[selectGroup])

  useEffect(() => {
    if (getGroup !== undefined) {
      if (getGroup.getgroup.data !== null) {
        setSelectGroupBookmar(getGroup.getgroup.data)
      }
    }
  },[getGroup])

  useEffect(() => {
    if (removeMsg !== undefined) {
      console.log(removeMsg);
      refetchGroup()
    }
  },[removeMsg])

  const checkBookmarkExist = (url) => {
    const bookmarks = selectGroupBookmark.bookMarks
    if (bookmarks === undefined) {
      return false
    }
    for (let i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].url === url) {
        return bookmarks[i].id
      }
    }
    return false
  }

  const handleSave = () => {
    if (checkLogin(userData.name, userData.password)) {
      try {
        if (!checkBookmarkExist(url)) {
          const groupId = GroupList.findIndex(group => group.id === selectGroup)
          addBookMarks({
            variables: {
              user: userData.name,
              password: userData.password,
              name: webTitle,
              url: url,
              groupid: GroupList[groupId].id,
              tags: selectTags
            }
          })
        } else {
          message.warn('URL already exist in selected group')
        }
      } catch {
        console.log('fail to create');
      }
    }
  }

  const handleRemove = () => {
    if (checkLogin(userData.name, userData.password)) {
      const bookmark_id = checkBookmarkExist(url)
      if (bookmark_id) {
        console.log('remove');
        removeBookMark({
          variables: {
            user: userData.name, 
            password: userData.password, 
            group_id: selectGroup, 
            bookMark_id: bookmark_id
          }
        })
      }
    }
  }

  const handleTitleChange = (e) => {
    setWebTitle(e.target.value)
  }

  const handleGroupChange = (group) => {
    if (group === 'New Group...') {
      if (checkLogin(userData.name, userData.password)) {
        setAddGroupVisible(true)
      }
    } else {
      setSelectGroup(group)
      const groupId = GroupList.findIndex(group => group.id === selectGroup)
      setTagList(GroupList[groupId].tags)
    }
  }

  const checkGroup = (groupname, privacy) => {
    const groupFilter = GroupList.filter(group => group.name === groupname);
    for(var i = 0; i < groupFilter.length; i++) {
      if (groupFilter[i].privacy === privacy) {
        message.warn('Group with same privacy is already exist')
        return false
      }
    }
    return true
  }

  const handleAddNewGroup = (groupname, privacy) => {
    if (checkGroup(groupname, privacy)) {
      addGroup({
        variables: {
          user: userData.name,
          password: userData.password,
          name: groupname,
          privacy: privacy
        }
      })
    }
  }

  return (
    <div className="App-bookmark">
      <Space direction="vertical" size={8}  style={{width: 250}}>
        <Row>
          <label>Name</label>
          <Input 
            addonAfter={<CheckCircleTwoTone twoToneColor={checkBookmarkExist(url) ? "#52c41a" : "#b9b7b29d"} />}
            value={webTitle} 
            size="small"
            onChange={handleTitleChange}
          ></Input>
        </Row>
        <Row>
          <label>Folder</label>
          <TreeSelect
            showSearch
            size="small"
            style={{ width: '100%', textAlign: 'left' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="Please select"
            value={selectGroup}
            treeDefaultExpandAll
            onChange={handleGroupChange}
          >
            { GroupList.map((group, index) => {
                return <TreeNode key={group.id} value={group.id} title={group.name}></TreeNode>
              }
            )}
            <TreeNode key={'New Group...'} value={'New Group...'} title={'New Group...'} style={{color: '#8b887d', borderTop: '1px solid rgb(43, 42, 40)'}}></TreeNode>
          </TreeSelect>
        </Row>
        <Row>
          <label>Tag</label>
          <Select 
            mode="tags" 
            size="small"
            style={{ width: '100%' }} 
            placeholder="Tags"
            onChange={(tags) => {setSelectTags(tags)}}
          >
            {tagList.map((tag) => {
              return <Option key={tag}>{ tag }</Option>
            })}
          </Select>
        </Row>
        <Row justify="end" style={{marginTop: 10}}>
          <Space>
            <Tooltip placement="topLeft" title={'Link to manage page'}>
              <Button style={{marginRight: 28}} onClick={handleHomePageClick}>more</Button>
            </Tooltip>
            <Button type="primary" onClick={handleSave}>Save</Button>
            <Button onClick={handleRemove}>Remove</Button>
          </Space>
        </Row>
      </Space>
      <ChatModal
        visible={addGroupVisible}
        onCreate={handleAddNewGroup}
        onCancel={() => {setAddGroupVisible(false)}}
      />
    </div>
  )
}

export default Bookmark