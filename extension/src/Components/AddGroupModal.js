import { Modal, Form, Input, Radio  } from "antd";
import { useState } from "react";

const ChatModal = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  const [privacy, setPrivacy] = useState(false)
  return (
    <Modal
      visible={visible}
      title="Create a new group"
      okText="Create" cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          form.resetFields();
          onCreate(values.name, privacy);
        }).catch((e) => { window.alert('Please enter the group name'); });
    }}>
     <Form form={form} layout="vertical" 
        name="form_in_modal">
        <Form.Item
          name="name" label="Name"
          rules={[{
            required: true,
            message: "Error: Please enter the name of the group!",
          },]}
        >
          <Input />
        </Form.Item>
      </Form>
      <Radio.Group onChange={(e) => {setPrivacy(e.target.value)}} value={privacy}>
        <Radio value={false}>public</Radio>
        <Radio value={true}>private</Radio>
      </Radio.Group>
    </Modal>
  );
};
export default ChatModal;
