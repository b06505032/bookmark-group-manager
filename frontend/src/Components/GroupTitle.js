import { Modal, Divider, message, Tooltip, Spin, Typography } from 'antd';
import { CloseSquareOutlined, LockOutlined, ExclamationCircleOutlined, BellOutlined, BellFilled, UsergroupAddOutlined } from '@ant-design/icons';
import { QueryGetGroupUsers } from '../graphql/querys';
import { useQuery, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { MutationUnsubscribeGroup, MutationSubscribeGroup, MutationInviteToGroup } from '../graphql/mutations';
import InviteToGroupModal from './InviteToGroupModal';
const { confirm } = Modal;
const { Title } = Typography;


const GroupTitle = ({account, groupid, groupname, owner, myGroupIDs, allUsers}) => {
    const { loading, error, data } = useQuery(QueryGetGroupUsers, {variables:{user: account.name, password: account.password, id: groupid}})
    const [unsubscribeGroup, {data: unsubscribeGroupData}] = useMutation(MutationUnsubscribeGroup)
    const [subscribeGroup, {data: subscribeGroupData}] = useMutation(MutationSubscribeGroup)
    const [invite] = useMutation(MutationInviteToGroup)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [inviteList, setInviteList] = useState([])
    
    useEffect(() => {
        if(unsubscribeGroupData){
            const { msg } = unsubscribeGroupData.unsubscribeGroup
            switch(msg) {
                case "you don't have this group ,nothing to remove": {
                    message.warning("Oops, internal server error.", 3)
                    break
                }
                case "unsubscribeGroup success": {
                    message.warning(`You will stop tracking ${groupname}!`, 3)
                    break
                }
                default: { }
            }
        }
    }, [unsubscribeGroupData])

    useEffect(() => {
        if(subscribeGroupData) {
            const { msg } = subscribeGroupData.subscribeGroup
            switch(msg) {
                case "group is private": {
                    message.error(`Sorry, ${groupname} is not allow to be subscribed.`, 3)
                    break
                }
                case "subscribe success": {
                    message.success(`You subscribe ${groupname}`, 3)
                    break
                }
                case "group already in your group list": {
                    message.info(`You have already subscribed ${groupname}`, 3)
                    break
                }
                default:{ }
            }
        }
    }, [subscribeGroupData])

    const handleClickDropout = (e) => {
        showConfirm(e)
    }

    const showConfirm = (e) => {
        const { type } = e
        var title
        switch(type) {
            case "Dropout": {
                title = `Are you sure to drop out from "${groupname}"?`
                break
            }
            case "Unsubscribe": {
                title = `Are you sure to unsubscribe "${groupname}"?`
                break
            }
            default:{ }
        }
        confirm({
            title: title,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be recovered.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                console.log('leave')
                await unsubscribeGroup({variables:{ user: account.name, password: account.password, group_id: groupid}})
            },
            onCancel() {
            },
        });
    }

    const handleClickSubscribe = async () => {
        console.log("click subscribe")
        await subscribeGroup({variables:{ user: account.name, password: account.password, group_id: groupid}})
    }

    const handleClickUnsubscribe = (e) => {
        showConfirm(e)
    }

    const handleClickInvite = () => {
        console.log("invite")
        setIsModalVisible(true)
    }
    
    const handleOk = async () => {
        var msgs = []
        setIsModalVisible(false)
        for (var i=0; i<inviteList.length; i++) {
            const _result = await invite({variables:{ user: account.name, password: account.password, group_id: groupid, receiverName: inviteList[i] }})
            const { msg } = _result
            msgs.push(msg)
        }
        if (msgs.includes("you are not owner of the group"))
            message.error("Oops, invitation is not sent", 3)
        else message.success("Invitation send!", 3)
    }
    
    const handleCancel = () => {
        setIsModalVisible(false)
    }

    if (loading) return (
        <Divider orientation="middle" style={{'color': '#66B3FF'}}>
            <Spin size="small" />
        </Divider>
    )
    if (error) return (
        <Divider orientation="middle" style={{'color': '#66B3FF'}}>
            Error!
        </Divider>
    )
    if (groupname === undefined) return (
        <Divider orientation="middle" style={{'color': '#66B3FF'}}>
            <Spin size="small" />
        </Divider>
    )
    if(data) {
        if(data.getgroup) {
            if(data.getgroup.data) {
                return (
                    <>
                    <Divider orientation="middle" style={{'color': '#66B3FF'}}>
                    <Title level={4} style={{'color': '#66B3FF'}}>
                        {data.getgroup.data.privacy?(<LockOutlined />):(<></>)}
                        {`     ${owner}  /  ${groupname}     `}
                        {data.getgroup.data.users.includes(`${account.name}#owner`) ? 
                        (<>
                            <Tooltip placement="top" title="click to invite others">
                                <UsergroupAddOutlined onClick={()=>{handleClickInvite()}}/>
                            </Tooltip>
                            {/* <Tooltip placement="top" title="click to delete">
                                <DeleteOutlined />
                            </Tooltip> */}
                        </>):
                        data.getgroup.data.users.includes(`${account.name}#editor`) ?
                        (<Tooltip placement="top" title="click to drop out">
                            <CloseSquareOutlined onClick={()=>{handleClickDropout({type: "Dropout"})}}/>
                        </Tooltip>):
                        myGroupIDs.includes(groupid)?
                        (<Tooltip placement="top" title="click to unsubscribe">
                            <BellFilled onClick={()=>{handleClickUnsubscribe({type: "Unsubscribe"})}}/>
                        </Tooltip>):
                        (<Tooltip placement="top" title="click to subscribe">
                            <BellOutlined onClick={()=>{handleClickSubscribe()}}/>
                        </Tooltip>)
                        }           
                    </Title>
                    </Divider>
                    <InviteToGroupModal
                        groupname = {groupname}
                        isModalVisible = {isModalVisible}
                        handleOk = {handleOk}
                        handleCancel = {handleCancel}
                        allUsers = {allUsers}
                        setInviteList = {setInviteList}
                    />
                    </>
                )
            }
        }
    }
    return (
        <Divider orientation="middle" style={{'color': '#66B3FF'}}>
            <Title level={4} style={{'color': '#66B3FF'}}>
                {`     ${owner}  /  ${groupname}     `}
                <Spin size="small" />
            </Title>
        </Divider>
    )
}
export default GroupTitle