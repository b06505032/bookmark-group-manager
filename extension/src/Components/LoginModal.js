import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import '../App.css';

const LoginModal = ({ visible, loginStatus, onCreate, onCancel, onRegister }) => {
  const onFinish = (values) => {
    onCreate(values)
  };

  return (
    <Modal
      visible={visible}
      title="Login"
      footer={null}
      onCancel={onCancel}
    >
      <Form
        name="normal_login"
        style={{maxWidth: 300+'px', margin: 'auto'}}
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          validateStatus={loginStatus.name.status}
          help={loginStatus.name.msg}
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined/>} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          validateStatus={loginStatus.password.status}
          help={loginStatus.password.msg}
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
            Log in
          </Button>
          Or <a onClick={onRegister}>register now!</a>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default LoginModal;