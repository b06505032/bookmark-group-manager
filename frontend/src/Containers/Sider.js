import { Layout, Menu, Spin, Alert } from 'antd';
const { Sider } = Layout;

const MySider = (props) => {

    return (
        <Sider style={{ overflow: 'auto', height: '100vh', left: 0, background: '#fff'}} >
            {props.loading ? 
            (<Spin size="large" />) 
            : props.error ? 
            (<Alert message="Error" type="error" showIcon />)
            : (
            <Menu theme="light" mode="inline" onClick={props.handleClickSideMenu}>
                <Menu.Item key={`SideMenu-All Groups`}>All Groups</Menu.Item>
                {props.sortGroupNames.map((item) => { 
                    return(<Menu.Item key={`SideMenu-${item.id}`}>{props.groupID_Owner[item.id]} / {item.name}</Menu.Item>)
                })}
            </Menu>
            )}
        </Sider>
    )
}

export default MySider