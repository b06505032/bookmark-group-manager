import { gql } from '@apollo/client';

const QueryGetUser = gql`
query($name: String!, $password: String!){
    getuser(name: $name, password: $password){
        data{
            id
            groups{
                id
                name
                users
            }
            messages{
                id
                type
                contain
            }
        }
        msg
    }
}
`

const QueryFindUser = gql`
query($name: String!, $type: String!){
    finduser(name: $name, type: $type){
        data{
            id
            groups{
                id
                name
                users
            }
        }
        msg
    }
}

`

const QueryFindGroups = gql`
query ($name: String!){
    findGroups(name: $name){
        name
        id
        users
    } 
  }
`

const QueryGetGroupUsers = gql`
query ($user: String!, $password: String!, $id: String!){
    getgroup(user: $user, password: $password, id: $id){
        data {
            users
            privacy
        }
        msg
    }
  }
`

const QueryGetGroupBookMarks = gql`
query ($user: String!, $password: String!, $id: String!){
    getgroup(user: $user, password: $password, id: $id){
        data{
            bookMarks{
                name
                url
                id
            }
        }
        msg
    }
  }
`

const QueryCheckUser = gql`
query ($name: String!, $password: String!){
    getuser(name: $name, password: $password){
      msg
    }
  }
`

const QueryAllUsers = gql`
query allUsers{
    allUsers   
}
`

const QueryAllGroups = gql`
query allGroups {
    allGroups   
}
`


export {
    QueryGetUser,
    QueryGetGroupBookMarks,
    QueryGetGroupUsers,
    QueryCheckUser,
    QueryAllUsers,
    QueryAllGroups,
    QueryFindUser,
    QueryFindGroups,
}