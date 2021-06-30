import { Layout, Space, Button } from 'antd';
import { useState } from 'react';
import styled from '@emotion/styled';
import GroupFilter from '../Components/GroupFilter';
import GroupTitle from '../Components/GroupTitle';
import BookMarkList from '../Components/BookMarkList';
const { Content } = Layout;

const MyContent = (props) => {
    const [listOrGrid, setListOrGrid] = useState("List")
    
    const handleClickListGrid = () => {
        const newlistOrGrid = listOrGrid === "List" ? "Grid": "List"
        setListOrGrid(newlistOrGrid)
    }

    return(
        <Content style={{ overflow: 'auto', height: '100vh', left: 0, background: '#fff', width: '500px'}} >
            <Space align="center">
            <Wrapper>
                {/* <GroupFilter  options = { allGroups.map(i => ({label:i, value: i})) }/> */}
                <GroupFilter  
                    options = { props.allGroupIDs.filter(j => {return !props.selectedGroupIDs.includes(j)}).map(i => {
                        return ({id: i, label: props.groupID_Name[i], value: i})
                    }) }
                    setSelectedGroupIDs = {props.setSelectedGroupIDs}
                />
            </Wrapper>
            <Button size="middle" onClick={()=>{handleClickListGrid()}}>
                {listOrGrid === "List" ? "Grid View": "List View"}
            </Button>
            </Space>
            {
                (props.selectedGroupIDs.length === 0 ? props.allGroupIDs:props.selectedGroupIDs).map((id)=>{
                    return(
                        <>
                            <GroupTitle
                                account = {props.account}
                                groupid = {id}
                                groupname = {props.groupID_Name[id]}
                                owner = {props.groupID_Owner[id]}
                                myGroupIDs = {props.myGroupIDs}
                                allUsers = {props.allUsers}
                            />
                            <BookMarkList
                                groupid = {id}
                                account = {props.account}
                                groupID_Name = {props.groupID_Name}
                                listOrGrid = {listOrGrid}
                            />
                        </>
                    )
                })
            }
        </Content>
    )

}

const Wrapper = styled.div`
  max-width: 900px;
  padding: 20px;
  h2 {
    font-weight: 300;
  }
`

export default MyContent