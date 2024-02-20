import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import _ from 'lodash';

type TTJSONConfig = {
    username: string;
    password: string;
    RecognitionTypeid: string;
};

const defaultTTConfig = {
    username: '',
    password: '',
    RecognitionTypeid: '1003',
};

export const EnvJSONConfig = () => {
    const [ttConfig, setTTConfig] = useState<TTJSONConfig>(defaultTTConfig);

    const handleSubmit = () => {
        const blob = new Blob([JSON.stringify(ttConfig, null, 4)], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'apikey.json';
        a.click();
    };

    return (
        <Form
            layout="vertical"
            initialValues={ttConfig}
            onValuesChange={(changedValues, allValues) => {
                setTTConfig((prevConfig) => {
                    const newConfig = { ...prevConfig };
                    _.merge(newConfig, changedValues);
                    return newConfig;
                });
            }}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={handleSubmit}
            className='mt-4'
        >
            <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true }]}>
                <Input.Password />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="bg-blue-500">
                    下载
                </Button>
            </Form.Item>
        </Form>
    );
};
