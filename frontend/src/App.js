import './App.css';
import { Layout, Button, notification, message } from 'antd';
import { useEffect, useState } from 'react';
import Header from './Containers/Header';
import Sider from './Containers/Sider';
import Content from './Containers/Content';
import Login from './Containers/Login';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { QueryGetUser, QueryFindUser, QueryAllUsers, QueryAllGroups, QueryFindGroups } from './graphql/querys';
import { MutationAcceptInvite, MutationRemoveMessage } from './graphql/mutations';
import { useCookies } from 'react-cookie';


function App() {
    const [userCookies, setUserCookie, removeUserCookie] = useCookies(['account'])
    const [loginCookies, setLoginCookie, removeLoginCookie] = useCookies(['login'])

    /* When developing, you can change the following variable */
    const [account, setAccount] = useState( userCookies['account'] || {name: '', password: ''});
    const [signIn, setSignIn] = useState( loginCookies['login'] || 'false')
    /* -------------------------------------------------- */

    const [allUsers, setAllUsers] = useState([])
    const [allGroups, setAllGroups] = useState([])
    
    const [myGroupIDs, setMyGroupsIDs] = useState([])
    const [groupID_Name, setGroupIDName] = useState({})
    const [groupID_Owner, setGroupIDOwner] = useState({})
    const [groups, setGroups] = useState([])
    const [groupSortBy, setGroupSortBy] = useState("Ascending")
    const [sortGroupNames, setSortGroupNames] = useState([])
    const [selectedGroupIDs, setSelectedGroupIDs] = useState([])
    const [notifications, setNotifications] = useState([])
    
    const { loading: getUserLoading, error, data: getUserData } = useQuery(QueryGetUser, {variables:{name: account.name, password: account.password}, pollInterval: 1500})
    const [ findUser, { loading: findUserLoading, data: findUserData} ] = useLazyQuery(QueryFindUser, {fetchPolicy: "no-cache"})
    const [ findGroups, { loading: findGroupsLoading, data: findGroupsData }] = useLazyQuery(QueryFindGroups, {fetchPolicy: "no-cache"})
    const [ getUsers, { data: allUsersData }] = useLazyQuery(QueryAllUsers, {fetchPolicy: "no-cache"})
    const [ getGroups, { data: allGroupsData}] = useLazyQuery(QueryAllGroups, {fetchPolicy: "no-cache"})

    const [ acceptInvite, {data: acceptInviteData} ] = useMutation(MutationAcceptInvite)
    const [ removeMessage ] = useMutation(MutationRemoveMessage)
    
    const closeNotification = async (_notificationID) => {
        console.log(
            'Notification was closed. Either the close button was clicked or duration time elapsed.',
        )
    }

    const closeAndDeleteNotification = async (_notificationID) => {
        await removeMessage({variables:{ user: account.name, password: account.password, message_id: _notificationID}})
    }
    
    /* Fetch login-in user data and notifications */
    useEffect(() =>{
        if(getUserData) {
            const { msg } =  getUserData.getuser
            switch(msg) {
                case "success":{
                    const { groups, messages } =  getUserData.getuser.data
                    setGroups(groups)
                    setNotifications(messages)
                    if (groups.length > 0)
                        setMyGroupsIDs(groups.map(i=>i.id))
                    break
                }
                default: { }
            }
        }
    }, [getUserData])
    
    /* Fetch the user names and groups names */
    useEffect(() => {
        if (signIn === 'true'){
            getUsers()
            getGroups()
        }
    }, [signIn])

    /* Set the user names and group names displaying in the search bar */
    useEffect(() => {
        if(allUsersData) {
            let _users = [...allUsersData.allUsers]
            _users = _users.sort()
            setAllUsers([..._users])
        }
        if(allGroupsData) {
            var _groups = [...Array.from(new Set(allGroupsData.allGroups))]
            _groups = _groups.sort()
            setAllGroups([..._groups])
        }
    }, [allUsersData, allGroupsData])

    /* Fetch the certain user's group data */
    useEffect(() => {
        if(findUserData) {
            const { msg } =  findUserData.finduser
            switch(msg) {
                case "success":{
                    const { groups } = findUserData.finduser.data
                    setGroups([...groups])
                    break
                }
                default: { }
            }
        }
    }, [findUserData])

    /* Fetch the group data (search by group name) */
    useEffect(() => {
        if(findGroupsData) {
            if (findGroupsData.findGroups)
                setGroups([...findGroupsData.findGroups])
        }
    }, [findGroupsData])

    /* Set the group data displaying in the content */
    useEffect(() => {
        var _groups = [...groups]
        _groups.sort((a, b) => a.name.localeCompare(b.name))
        setSortGroupNames(_groups)
        var _groupIDName = {}
        var _groupIDOwner = {}
        groups.map(i=>{
            const {id, name, users} = i
            _groupIDName[id] = name
            if (users.length > 0) {
                if(users[0].includes('#owner')){
                    const owner = users[0].split('#')[0]
                    _groupIDOwner[id] = owner
                }
                else {
                    _groupIDOwner[id] = ""
                }
            } else {
                _groupIDOwner[id] = ""
            }
            return 0
        })
        setGroupIDName({..._groupIDName})
        setGroupIDOwner({..._groupIDOwner})
    }, [groups])

    /* Show the notification when get the message */
    useEffect(() => {
        const clickAcceptGroupInvite = async (_key, _notificationID) => {
            await acceptInvite({variables:{ user: account.name, password: account.password, message_id: _notificationID}})
            notification.close(_key)
            await removeMessage({variables:{ user: account.name, password: account.password, message_id: _notificationID}})
        }
        
        const clickAcceptComment = async (_key, _notificationID, URL) => {
            await removeMessage({variables:{ user: account.name, password: account.password, message_id: _notificationID}})
            notification.close(_key)
            window.open(URL, '_blank')
        }

        const openNotification = (_notification) => {
            const key = `open${Date.now()}`
            var URL
            if (_notification.type.includes("url#")) {
                URL = _notification.type.split('#')[1]
            }
                
            const btn = (
                <Button type="primary" size="small" 
                    onClick={_notification.type === "group_invite"?
                        ()=>{clickAcceptGroupInvite(key, _notification.id)}:
                        ()=>{clickAcceptComment(key, _notification.id, URL)}}
                >
                    {_notification.type === "group_invite"?'Accept':'Go to website.'}
                </Button>
            )
            if (_notification.type === "group_invite")
                notification.open({
                    message: _notification.type === "group_invite" ? "New Group Invitation!": "New message",
                    description: _notification.contain,
                    btn,
                    key,
                    onClose: closeNotification,
                    duration: 0
                })
            else if (_notification.type.includes("url#")) {
                const _url = _notification.type.split('#')[1]
                const sender = _notification.contain.split('#@#')[0]
                const senderMsg = _notification.contain.split('#@#')[1]
                const _description = `${sender} replys "${senderMsg}" on ${_url}.`
                notification.open({
                    message: "New message",
                    description: _description,
                    btn,
                    key,
                    onClose: ()=>{closeAndDeleteNotification(_notification.id)},
                    duration: 0
                })
            }
        }
        
        notifications.map(i => {
            openNotification(i)
            return 0
        })
    }, [notifications])

    /* Show the message after accepting invite group */ 
    useEffect(()=> {
        if(acceptInviteData) {
            const {msg} = acceptInviteData.acceptInvite
            switch(msg){
                case "you accept this invite successfully": {
                    message.success("You join the group!", 3)
                    break
                }
                case "group aready in your group list":{
                    message.info("You have already joined the group!", 3)
                    break
                }
                default:{ }
            }
        }
    }, [acceptInviteData])

    /* Change the sider bar when the sorting change */
    useEffect( () => {
        var _display = []
        setSortGroupNames(_display)
        var _groups = [...groups]
        switch(groupSortBy){
            case "Ascending": {
                _display = _groups.sort((a, b) => a.name.localeCompare(b.name))
                break
            }
            case "Descending": {
                _display = _groups.sort((a, b) => a.name.localeCompare(b.name)).reverse()
                break
            }
            default:{
                _display = _groups.sort((a, b) => a.name.localeCompare(b.name))
                break
            }
        }
        setSortGroupNames(_display)
    }, [groupSortBy])


    const handleClickSideMenu = e => {
        var id = e.key.split('-')[1]
        // console.log(id)
        setSelectedGroupIDs(id==="All Groups"?[]:[id])
    }
  
    return (
        <Layout>
            <Header
                groupSortBy = {groupSortBy}
                setGroupSortBy = {setGroupSortBy}
                account = {account}
                setAccount = {setAccount}
                signIn = {signIn}
                setSignIn = {setSignIn}
                findUser = {findUser}
                findGroups = {findGroups}
                allUsers = {allUsers}
                allGroups = {allGroups}
                removeUserCookie = {removeUserCookie}
                removeLoginCookie = {removeLoginCookie}
            />
            {signIn === 'true' ?
            (<Layout>
                <Sider
                    loading = { getUserLoading || findUserLoading || findGroupsLoading }
                    error = {error}
                    sortGroupNames = {sortGroupNames}
                    handleClickSideMenu = {handleClickSideMenu}
                    groupID_Owner = {groupID_Owner}
                />
                <Content
                    account = {account}
                    allGroupIDs = {groups.map(i=> i.id)}
                    selectedGroupIDs = {selectedGroupIDs}
                    setSelectedGroupIDs = {setSelectedGroupIDs}
                    groupID_Name = {groupID_Name}
                    groupID_Owner = {groupID_Owner}
                    myGroupIDs = {myGroupIDs}
                    allUsers = {allUsers}
                />
            </Layout>) :
            (<Login
                setAccount = {setAccount}
                setSignIn = {setSignIn}
                setUserCookie = {setUserCookie}
                setLoginCookie = {setLoginCookie}
            />)
            }
            {/* <Footer>Footer</Footer> */}
        </Layout>
    )
}

export default App;