import { gql } from '@apollo/client';

export const QueryGetUser = gql`
  query($name: String!, $password: String!) {
    getuser(name: $name, password: $password) {
      data{
        id
        name
        password
        tags
        friends {
          name
        }
        groups {
          id
          name
          privacy
          users
          tags
        }
        messages {
          id
          type
          receiver_id
          contain
        }
      }
      msg
    }
  }
`

export const QueryGetGroup = gql`
  query($user: String!, $password: String!, $id: String!) {
    getgroup(user: $user, password: $password, id: $id) {
      data {
        name
        id
        users
        bookMarks {
          name
          url
          id
        }   
        tags
      }
      msg
    }
  }
`

export const QueryGetWebsite = gql`
  query($url: String!){
    getWebsite(url: $url){
      id
      url
      comments{
        id
        type
        contain
        sender_id
        receiver_id
        createTime
      }
      rank
    } 
  }
`