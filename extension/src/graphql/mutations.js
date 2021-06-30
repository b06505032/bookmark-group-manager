import { gql } from '@apollo/client';

export const createUser = gql`
  mutation createUser($name: String!, $password: String!){
  	createUser(
      data: {
        name: $name
        password: $password
      }
    ) {
      data {
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
        }
      }
      msg
    }
  }
`

export const createBookMarks = gql`
 mutation createBookMarks(
    $user: String!, 
    $password: String!, 
    $name: String!, 
    $url: String!, 
    $groupid: String!
    $tags: [String!]
  ) {
    createBookMarks(
      data:{
        user: $user
        password: $password
        name: $name
        url: $url
        groupid: $groupid
        tags: $tags
      }
    ) {
      data {
        id
        name
        createTime
        url
      }
      msg
    }
  }
`

export const removeBookMarks = gql`
  mutation removeBookMarks(
    $user: String!
    $password: String!
    $group_id: String!
    $bookMark_id: String!
  ) {
  	removeBookMarks(
        user: $user
        password: $password
        group_id: $group_id
        bookMark_id: $bookMark_id
    ) {
      msg
    }
  }
`

export const createGroup = gql`
  mutation createGroup(
    $user: String!
    $password: String!
    $name: String!
    $privacy: Boolean!
  ) {
  	createGroup(
      data: {
        user: $user
        password: $password
        name: $name
        privacy: $privacy
      }
    ) {
      data {
        id
        name
        users
        privacy
      }
      msg
    }
}
`

export const createComment = gql`
  mutation addComment(
    $user: String!
    $password: String!
    $contain: String!
    $receiver_id: String!
    $url: String!
  ) {
  	addComment(
      user: $user
      password: $password
      contain: $contain
      receiver_id: $receiver_id
      url: $url
    ) {
      data {
        contain
        id
      }
      msg
    }
  }
`

export const rankwebsite = gql`
  mutation rankwebsite(
    $user: String!
    $password: String!
    $rank: Int!
    $url: String!
  ) {
    rankwebsite(
      user: $user
      password: $password
      rank: $rank
      url: $url
    ) {
      msg
    }
  }
`