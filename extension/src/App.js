/*global chrome*/
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Draggable from 'react-draggable';
import { message } from 'antd';

import './App.css';
import Header from './Components/Header'
import Bookmark from './Containers/Bookmark';
import Comments from './Containers/Comments';
import LoginModal from './Components/LoginModal';
import RegisterModal from './Components/RegisterModal';
import { QueryGetUser, createUser } from './graphql'

export const UserDataContext = React.createContext({});
const LOCALSTORAGE_KEY = "save-account"

function App() {
  // app own
  const savedAccount = localStorage.getItem(LOCALSTORAGE_KEY);
  const [account, setAccount] = useState(JSON.parse(savedAccount) || {name: '', password: ''});
  const [ userData, setUserData ] = useState({});
  const [ loginVisible, setLoginVisible ] = useState(false);
  const [ RegisterVisible, setRegisterVisible ] = useState(false)

  // modal
  const [ loginStatus, setLoginStatus ] = useState({ name:{ status: undefined, msg: undefined}, password:{ status: undefined, msg: undefined}})
  const [ registerStatus, setRegisterStatus ] = useState({ name:{ status: undefined, msg: undefined}, password:{ status: undefined, msg: undefined}})

  // backend
  const { data: getUserData, refetch: refetchUser } = useQuery(QueryGetUser, {variables:{name: account.name, password: account.password}})
  const [addUser, {data: User}] = useMutation(createUser);

  // useEffect(() => {
  //   console.log(account);
  //   console.log('refetch query');
  //   refetch()
  // }, [account])
  
  useEffect(() => {
    if (getUserData !== undefined) {
      console.log(getUserData);
      var newLoginStatus = loginStatus
      if (getUserData.getuser.data !== null) {
        setUserData(getUserData.getuser.data)
        newLoginStatus.name.status = undefined
        newLoginStatus.name.msg = undefined
        setLoginStatus(newLoginStatus)
        setLoginVisible(false)
      } else {
        if (account.name !== '') {
          if (getUserData.getuser.msg === 'not_exist') {
            newLoginStatus.name.status = 'error'
            newLoginStatus.name.msg = 'User does not exist'
          } else if (getUserData.getuser.msg === 'wrong_password') {
            newLoginStatus.name.status = undefined
            newLoginStatus.name.msg = undefined
            newLoginStatus.password.status = 'error'
            newLoginStatus.password.msg = 'wrong password'
          }
          setLoginStatus(newLoginStatus)
          setLoginVisible(true)
        }
        // logout
        setUserData({})
      }
    }
  },[getUserData])
  
  useEffect(() => {
    if (User !== undefined) {
      console.log(User);
      var newRegisterStatus = registerStatus
      if (User.createUser.msg === 'success') {
        message.success('Register success')
        newRegisterStatus.name.status = undefined
        newRegisterStatus.name.msg = undefined
        setRegisterStatus(newRegisterStatus)
        setRegisterVisible(false)
        setLoginVisible(true)
      } else {
        if (User.createUser.msg === 'user already exist') {
          newRegisterStatus.name.status = 'error'
          newRegisterStatus.name.msg = 'User already exist'
        }
        setRegisterStatus(newRegisterStatus)
        setRegisterVisible(true)
      }
    }
  },[User])
  
    const handleHomePageClick = () => {
      /* This is use for sending payload when direct to homepage */
      const payload = {
        name: account.name,
        password: account.password
      }
      chrome.runtime.sendMessage({ msg: 'login', payload })
      /* ------------------------------------------------------- */
      console.log('Link to home page');
      // window.open('http://localhost:3000/', '_blank');
    }
  
  // account handler
  const handleRegister = (values) => {
    console.log('handleRegister');
    addUser({
      variables: {
        name: String(values.username),
        password: String(values.password)
      }
    })
    setRegisterVisible(false)
  }

  const handleLogin = (values) => {
    const loginAccount = {
      name: String(values.username),
      password: String(values.password)
    }
    setAccount(loginAccount)
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(loginAccount));
    setLoginVisible(false)
  }

  const handleLogout = () => {
    console.log('log out');
    const loginAccount = {
      name: '',
      password: ''
    }
    setAccount(loginAccount)
    chrome.runtime.sendMessage({ msg: 'logout', payload: loginAccount })
    localStorage.clear();
  }

  const checkLogin = (name, password) => {
    if (name === undefined || password === undefined){
      setLoginVisible(true)
      return false
    } else {
      return true
    }
  }

  return (
    // <Draggable handle="strong">
      <div className="App">
        <UserDataContext.Provider value={ userData }>
          {/* <strong> */}
            <Header handleHomePageClick={handleHomePageClick}></Header>
          {/* </strong> */}
          <Bookmark 
            handleHomePageClick={handleHomePageClick}
            checkLogin={checkLogin}
            refetchUser={refetchUser}
          ></Bookmark>
          <Comments 
            handleHomePageClick={handleHomePageClick}
            checkLogin={checkLogin}
            handleLogout={handleLogout}
          ></Comments>
          <RegisterModal
            visible={RegisterVisible}
            registerStatus={registerStatus}
            onCreate={handleRegister}
            onCancel={() => setRegisterVisible(false)}
            onLogin={() => {
              setRegisterVisible(false)
              setLoginVisible(true)
            }}
          ></RegisterModal>
          <LoginModal 
            visible={loginVisible}
            loginStatus={loginStatus}
            onCreate={handleLogin}
            onCancel={() => {setLoginVisible(false)}}
            onRegister={() => {
              setLoginVisible(false)
              setRegisterVisible(true)
              setLoginStatus({ name:{ status: undefined, msg: undefined}, password:{ status: undefined, msg: undefined}})
            }}
          ></LoginModal>
        </UserDataContext.Provider>
      </div>
    // </Draggable>
  );
}

export default App;
