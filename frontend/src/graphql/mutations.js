import { gql } from '@apollo/client'

const MutationAcceptInvite = gql`
mutation ($user:String!, $password:String!, $message_id:String!) {
    acceptInvite(user: $user, password: $password, message_id: $message_id){
        msg
    }
}
`

const MutationInviteToGroup = gql`
mutation ($user:String!, $password:String!, $group_id:String!, $receiverName:String!){
    inviteToGroup(user: $user, password: $password, group_id: $group_id, receiverName: $receiverName){
        msg
    }
}
`

const MutationRemoveBookMarks = gql`
mutation ($user:String!, $password:String!, $group_id:String!, $bookMark_id:String!){
    removeBookMarks(user: $user, password: $password, group_id: $group_id, bookMark_id: $bookMark_id) {
        msg
    }
}
`

const MutationRemoveMessage = gql`
mutation ($user:String!, $password:String!, $message_id:String!){
    removeMessage(user: $user, password: $password, message_id: $message_id){
        msg
    }
}
`

const MutationUnsubscribeGroup = gql`
mutation ($user:String!, $password:String!, $group_id:String!){
    unsubscribeGroup(user: $user, password: $password, group_id: $group_id){
        msg
    }
}
`

const MutationSubscribeGroup = gql`
mutation ($user:String!, $password:String!, $group_id:String!){
    subscribeGroup(user: $user, password: $password, group_id: $group_id){
        data {
            name
            id
        }
        msg
    }
}
`

export {
    MutationAcceptInvite, 
    MutationInviteToGroup,
    MutationRemoveBookMarks,
    MutationRemoveMessage,
    MutationUnsubscribeGroup,
    MutationSubscribeGroup,
}