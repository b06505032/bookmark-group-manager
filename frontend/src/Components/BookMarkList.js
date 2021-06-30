import { useEffect, useState } from 'react';
import { Modal, List, Tag, message, Card, Row, Col } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { QueryGetGroupBookMarks } from '../graphql/querys';
import { MutationRemoveBookMarks } from '../graphql/mutations';
const { confirm } = Modal;
const { Meta } = Card;


const LoadMoreList = ({account, groupid, groupID_Name, listOrGrid}) => {
    const [list, setList] = useState([])
    
    const { loading, data: getGroupData, refetch } = useQuery(QueryGetGroupBookMarks, {variables: {user: account.name, password: account.password, id: groupid} })
    const [ removeBookMarks, {data: removeBookMarksData}] = useMutation(MutationRemoveBookMarks)

    useEffect(()=>{
        if(getGroupData){
            if (getGroupData.getgroup.msg === "found"){
                setList(getGroupData.getgroup.data.bookMarks)
            }
        }
    }, [getGroupData])
    

    useEffect(()=>{
        if(removeBookMarksData){
            const { msg } = removeBookMarksData.removeBookMarks
            switch(msg) {
                case "delete success": {
                    message.warning('You delete the bookmark!', 3)
                    refetch()
                    break
                }
                case "you are not editor":{
                    message.error('Oops, you are not an editor of the group. You don\'t have the access to delete the bookmark.', 5)
                    break
                }
                default: { }
            }
        }
    }, [removeBookMarksData])


    const handleClickEditDelete = (e) => {
        const { type } = e
        switch(type){
            case "Edit": {
                console.log("gonna edit")
                break
            }
            case "Delete":{
                showDeleteConfirm(e)
                break
            }
            default: { }
        }
    }

    const showDeleteConfirm = (e) => {
        const { bookmarkID, bookmarkName } = e
        confirm({
            title: `Are you sure to delete "${bookmarkName}" from "${groupID_Name[groupid]}"?`,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be recovered.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                await removeBookMarks({variables:{ user: account.name, password: account.password, group_id: groupid, bookMark_id: bookmarkID}})
            },
            onCancel() {
            },
        });
    }
      
    var rows = []
    for (var i = 0; i < parseInt(list.length/4)+1; i++) {
        var cards  = []
        for (var j = i*4 ; j < Math.min((i+1)*4, list.length); j++) {
            const card = 
                <MyCard
                    key={`${groupid}-${list[j].id}`}
                    groupid={groupid}
                    bookmarkid={list[j].id}
                    name={list[j].name.split('@')[0]}
                    url={list[j].url}
                    tags={list[j].name.split('@')}
                    loading = {loading}
                    handleClickEditDelete = {handleClickEditDelete}
                />
            cards.push(card)
        }
        const row = <Row gutter={16}>{cards}</Row>
        rows.push(row)
    }

    return listOrGrid === "Grid" ? (
        <>
            {rows}
        </>
    ) :
    (
        <List
            size="small"
            className="demo-loadmore-list"
            loading={loading}
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => {
                const name = item.name.split('@')[0]
                var tags = item.name.split('@')
                tags.splice(0, 1)
                return (
                    <List.Item
                        actions={[
                            // <EditOutlined onClick={()=>{handleClickEditDelete({type: "Edit", bookmarkID: item.id})}}/>, 
                            <DeleteOutlined onClick={()=>{handleClickEditDelete({type: "Delete", bookmarkID: item.id, bookmarkName: item.name})}}/>,
                        ]}
                    >
                        <List.Item.Meta
                            title={<a href={item.url} target="_blank" rel="noopener noreferrer">{name}</a>}
                            key={`ListItemMeta-${groupid}-${item.id}`}
                        />
                        {tags.map(i=>(<Tag key={`ListItemTag-${groupid}-${item.id}-${i}`}>{i}</Tag>))}
                    </List.Item>
                )
            }}
        />
    )
  
}
export default LoadMoreList


const MyCard = ({loading, groupid, bookmarkid, name, url, tags, handleClickEditDelete}) => {
    var _tags = [...tags]
    _tags.splice(0, 1)
    return (
        <Col span={6}>
            <Card
                loading = {loading}
                style={{ width: 300 }}
                actions={[
                    _tags.map(i=>(<Tag key={`ListItemCardTag-${groupid}-${bookmarkid}-${i}`}>{i}</Tag>)),
                    <DeleteOutlined onClick={()=>{handleClickEditDelete({type: "Delete", bookmarkID: bookmarkid, bookmarkName: name})}}/>
                ]}
            >
                <Meta
                    title={<a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "black" }}>{name}</a>}
                    description={<a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "gray" }}>{url}</a>}
                />
            </Card>
        </Col>
    )
}