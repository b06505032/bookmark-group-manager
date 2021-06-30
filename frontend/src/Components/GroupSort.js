import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';


const GroupSort = ({groupSortBy, setGroupSortBy}) => {

    const onClick = ({ key }) => {
        setGroupSortBy(key)
    }

    const items = ["Ascending", "Descending"]

    const menu = (
        <Menu onClick={onClick}>
            {items.map(i=>{
                return (<Menu.Item key={i}>{i}</Menu.Item> )
            })}
        </Menu>
    )

    return(
        <Dropdown overlay={menu} trigger={['click']}>
            <Button>
                {groupSortBy} <DownOutlined />
            </Button>
        </Dropdown>
    )
}
export default GroupSort
