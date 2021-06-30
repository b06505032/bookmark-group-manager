import { useState } from "react";
import { Modal, Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../App.css';

const RegisterModal = ({visible, registerStatus, onCreate, onCancel, onLogin}) => {
  const onFinish = (values) => {
    onCreate(values)
  };

  return (
    <Modal
      visible={visible}
      title="Register"
      footer={null}
      onCancel={onCancel}
    >
      <Form
        name="normal_register"
        style={{maxWidth: 300+'px', margin: 'auto'}}
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          validateStatus={registerStatus.name.status}
          help={registerStatus.name.msg}
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined/>} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          validateStatus={registerStatus.password.status}
          help={registerStatus.password.msg}
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input
            prefix={<LockOutlined/>}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{float: 'left'}}>Remember me</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{width: 100+'%'}}>
            Register
          </Button>
          Or <a onClick={onLogin}>login now!</a>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default RegisterModal;