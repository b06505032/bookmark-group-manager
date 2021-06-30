import { Modal, Select} from 'antd';
const { Option } = Select;

const InviteToGroupModal = ({groupname, isModalVisible, handleOk, handleCancel, allUsers, setInviteList}) => {

    const handleChange = (inviteList) => {
        setInviteList([...inviteList])
    }
    const title = `Invite others to edit ${groupname}!`

    return(
        <Modal title={title} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Invite">
            <Select
                mode="multiple"
                size='large'
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select users"
                defaultValue={[]}
                onChange={handleChange}
            >
                {allUsers.map(name=> 
                    (<Option key={name}>{name}</Option>)
                )}
            </Select>
        </Modal>
    )
}
export default InviteToGroupModal