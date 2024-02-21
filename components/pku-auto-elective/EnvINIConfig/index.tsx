import { useState, useEffect } from 'react';
import ini from 'ini';
import _ from 'lodash';
import {
    ConfigProvider,
    theme,
    Form,
    Card,
    Input,
    InputNumber,
    Select,
    Button,
    Divider,
    Collapse,
    Checkbox,
    Space,
} from 'antd';
import type { CollapseProps } from 'antd';

type User = {
    student_id: number;
    password: string;
    dual_degree: boolean;
    identity: 'bzx' | 'bfx';
};

type Client = {
    supply_cancel_page: number;
    refresh_interval: number;
    random_deviation: number;
    iaaa_client_timeout: number;
    elective_client_timeout: number;
    elective_client_pool_size: number;
    elective_client_max_life: number;
    login_loop_interval: number;
    print_mutex_rules: boolean;
    debug_print_request: boolean;
    debug_dump_request: boolean;
};

type Monitor = {
    host: string;
    port: number;
};

type Notification = {
    disable_push: boolean;
    token: string;
    verbosity: 1 | 2;
    minimum_interval: number;
};

type Course = {
    id: string;
    name: string;
    class: number;
    school: string;
};

type Mutex = {
    courses: string[];
};

type Config = {
    config_name: string;
    user: User;
    client: Client;
    monitor: Monitor;
    notification: Notification;
    [key: `course:${string}`]: Course[];
    [key: `mutex:${string}`]: Mutex;
};

const { Option } = Select;

const ClientCollapse = () => {
    const items: CollapseProps['items'] = [
        {
            key: '1',
            label: '展开其他配置项（不建议修改）',
            children: (
                <>
                    <Form.Item name={['client', 'refresh_interval']} label="刷新间隔" rules={[{ required: true }]}>
                        <InputNumber min={0.1} className="w-full" step="0.1" stringMode />
                    </Form.Item>
                    <Form.Item name={['client', 'random_deviation']} label="偏移量分数" rules={[{ required: true }]}>
                        <InputNumber min={0} className="w-full" step="0.01" stringMode />
                    </Form.Item>
                    <Form.Item
                        name={['client', 'iaaa_client_timeout']}
                        label="IAAA 客户端超时"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name={['client', 'elective_client_timeout']}
                        label="elective 客户端超时"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name={['client', 'elective_client_pool_size']}
                        label="elective 会话数"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} max={5} className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name={['client', 'elective_client_max_life']}
                        label="elective 存活时间"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={-1} className="w-full" />
                    </Form.Item>
                    <Form.Item name={['client', 'login_loop_interval']} label="登录间隔" rules={[{ required: true }]}>
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                    <Form.Item
                        name={['client', 'print_mutex_rules']}
                        valuePropName="checked"
                        labelAlign="left" // 设置标签对齐方式为左对齐
                        style={{ display: 'flex', alignItems: 'center' }} // 设置表单项为flex布局，并垂直居中对齐
                    >
                        <Checkbox>打印互斥规则</Checkbox>
                    </Form.Item>

                    <Form.Item name={['client', 'debug_print_request']} valuePropName="checked">
                        <Checkbox>打印请求细节</Checkbox>
                    </Form.Item>
                    <Form.Item name={['client', 'debug_dump_request']} valuePropName="checked">
                        <Checkbox>记录请求日志</Checkbox>
                    </Form.Item>
                </>
            ),
        },
    ];
    return <Collapse items={items} />;
};

const CourseItem = ({ id, onDelete }) => {
    return (
        <Form.Item>
            <Card bordered>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p className="font-bold">{id}</p>
                    <Form.Item name={[id, 'name']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="课程名" />
                    </Form.Item>
                    <Form.Item name={[id, 'class']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="班号" />
                    </Form.Item>
                    <Form.Item name={[id, 'school']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="开课单位" />
                    </Form.Item>
                    <Button danger onClick={() => onDelete(id)}>
                        删除此课程
                    </Button>
                </Space>
            </Card>
        </Form.Item>
    );
};

const MutexItem = ({ id, onDelete, courseOptions }) => {
    return (
        <Form.Item>
            <Card bordered>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p className="font-bold">{id}</p>
                    <Form.Item name={[id, 'courses']} noStyle rules={[{ required: true, message: '请选择课程' }]}>
                        <Select mode="multiple" placeholder="选择课程" options={courseOptions} />
                    </Form.Item>
                    <Button danger onClick={() => onDelete(id)}>
                        删除此互斥规则
                    </Button>
                </Space>
            </Card>
        </Form.Item>
    );
};

const defaultINIConfig: Config = {
    config_name: 'config.ini',
    user: {
        student_id: 1000000000,
        password: '',
        dual_degree: false,
        identity: 'bzx',
    },
    client: {
        supply_cancel_page: 1,
        refresh_interval: 2,
        random_deviation: 0.01,
        iaaa_client_timeout: 30,
        elective_client_timeout: 60,
        elective_client_pool_size: 2,
        elective_client_max_life: 600,
        login_loop_interval: 2,
        print_mutex_rules: true,
        debug_print_request: false,
        debug_dump_request: false,
    },
    monitor: {
        host: '127.0.0.1',
        port: 7074,
    },
    notification: {
        disable_push: true,
        token: '0',
        verbosity: 1,
        minimum_interval: 0,
    },
};

export const EnvINIConfig = () => {
    const [config, setConfig] = useState(defaultINIConfig);

    const [newCourseId, setNewCourseId] = useState<string>('');

    const addCourse = () => {
        // 检查是否为空、重复、含有空字符
        if (newCourseId === '' || newCourseId.includes(' ') || config[`course:${newCourseId}`]) {
            console.log('Invalid course id: ', newCourseId);
            return;
        }
        setConfig((prevConfig) => ({
            ...prevConfig,
            [`course:${newCourseId}`]: {
                name: '',
                class: 0,
                school: '',
            },
        }));
        setNewCourseId('');
    };

    const deleteCourse = (id: string) => {
        if (!id.startsWith('course:') || !config[id]) {
            return;
        }
        let newConfig = { ...config };
        delete newConfig[id];
        setConfig(newConfig);
    };

    const [newMutexId, setNewMutexId] = useState<string>('');
    const courseOptions = Object.keys(config)
        .filter((key) => key.startsWith('course:'))
        .map((courseKey) => ({
            label: `${config[courseKey].name}-${config[courseKey].class}-${config[courseKey].school}`, // 假设每个课程数组只有一个对象
            value: courseKey,
        }));

    const addMutex = () => {
        // 检查是否为空、重复、含有空字符
        if (newMutexId === '' || newMutexId.includes(' ') || config[`mutex:${newMutexId}`]) {
            console.log('Invalid mutex id: ', newMutexId);
            return;
        }
        setConfig((prevConfig) => ({
            ...prevConfig,
            [`mutex:${newMutexId}`]: {
                courses: [],
            },
        }));
        setNewMutexId('');
    };

    const deleteMutex = (id: string) => {
        if (!id.startsWith('mutex:') || !config[id]) {
            return;
        }
        let newConfig = { ...config };
        delete newConfig[id];
        setConfig(newConfig);
    };

    const handleValuesChange = (changedValues) => {
        // console.log('allValues: ', allValues);
        // setConfig({ ...defaultINIConfig, ...allValues });
        setConfig((prevConfig) => {
            // 使用展开运算符创建一个新的config对象
            const newConfig = { ...prevConfig };
            // 使用lodash的merge函数合并变化的值
            _.merge(newConfig, changedValues);
            // 返回新对象触发重新渲染
            return newConfig;
        });
        console.log(config);
    };

    const handleSubmit = () => {
        // 对于 config 的每个类似于 'mutex:xxx' 的 key，将其 courses 数组转换为字符串
        const newConfig = { ...config };
        console.log(newConfig);
        // 删除 config.name 项
        delete newConfig.config_name;
        for (const key in config) {
            if (key.startsWith('mutex:')) {
                newConfig[key].courses = config[key].courses
                    .map((course: string) => {
                        // 删掉前缀
                        return course.replace('course:', '');
                    })
                    .join(',');
            }
        }
        const iniConfig = ini.stringify(newConfig);
        // copy(iniConfig);
        // 下载文件，文件名为 config.config_name
        const blob = new Blob([iniConfig], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = config.config_name;
        a.click();
    };

    return (
        <Form
            layout="vertical"
            initialValues={config}
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
        >
            <Form.Item name={['config_name']} label="配置文件名" rules={[{ required: true }]} className="mt-4 mb-2">
                <Input />
            </Form.Item>
            <Form.Item>
                <p className="mb-2 mx-2 dark:text-gray-200 text-gray-800 opacity-50">以 .ini 结尾，不要含有空格</p>
            </Form.Item>
            <Divider orientation="left">User</Divider>
            <Form.Item name={['user', 'student_id']} label="学号" rules={[{ required: true }]}>
                <InputNumber className="w-full" min="1000000000" max="2999999999" />
            </Form.Item>
            <Form.Item name={['user', 'password']} label="密码" rules={[{ required: true }]}>
                <Input.Password />
            </Form.Item>
            <Form.Item name={['user', 'dual_degree']} valuePropName="checked">
                <Checkbox>是否有双学位</Checkbox>
            </Form.Item>
            <Form.Item
                name={['user', 'identity']}
                label="选课身份"
                rules={[{ required: true }]}
                className={config.user.dual_degree ? '' : 'hidden'}
            >
                <Select>
                    <Option value="bzx">主修选课</Option>
                    <Option value="bfx">辅双选课</Option>
                </Select>
            </Form.Item>

            <Divider orientation="left">Client</Divider>
            <Form.Item
                name={['client', 'supply_cancel_page']}
                label="刷取页面"
                rules={[{ required: true }]}
                className="mb-2"
            >
                <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item className="mb-2">
                <p className="mx-2 dark:text-gray-200 text-gray-800 opacity-50">
                    所需选课的课程在“补退选”的第几页
                    <br />
                    如果有多页，请使用多个配置配置文件
                </p>
            </Form.Item>

            <Form.Item>
                <ClientCollapse />
            </Form.Item>

            <Divider orientation="left">Monitor</Divider>
            <Form.Item>
                <Collapse
                    items={[
                        {
                            key: '1',
                            label: '展开监视配置项（不建议修改）',
                            children: (
                                <>
                                    <Form.Item
                                        name={['monitor', 'host']}
                                        label="监视服务器地址"
                                        rules={[{ required: true }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        name={['monitor', 'port']}
                                        label="监视服务器端口"
                                        rules={[{ required: true }]}
                                    >
                                        <InputNumber min={1} max={65535} className="w-full" />
                                    </Form.Item>
                                </>
                            ),
                        },
                    ]}
                    className="w-inherit"
                />
            </Form.Item>

            <Divider orientation="left">Notification (iOS Only)</Divider>
            <Form.Item name={['notification', 'disable_push']} valuePropName="checked">
                <Checkbox>禁用推送通知</Checkbox>
            </Form.Item>
            <Form.Item className={config.notification.disable_push ? 'hidden' : ''}>
                <Form.Item
                    name={['notification', 'token']}
                    label="iOS Bark Token"
                    rules={[{ required: !config.notification.disable_push }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={['notification', 'verbosity']}
                    label="通知详细程度"
                    rules={[{ required: !config.notification.disable_push }]}
                >
                    <Select>
                        <Option value={1}>简略</Option>
                        <Option value={2}>详细</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name={['notification', 'minimum_interval']}
                    label="推送通知最小间隔"
                    rules={[{ required: !config.notification.disable_push }]}
                    className="mb-2"
                >
                    <InputNumber min={-1} className="w-full" />
                </Form.Item>
                <Form.Item className="mb-2">
                    <p className="mb-1 mx-2 dark:text-gray-200 text-gray-800 opacity-50">
                        消息时间间隔，单位为秒
                        <br />
                        若消息产生时，距离上次成功发送不足这一时间，则取消发送。-1为不设置
                    </p>
                </Form.Item>
            </Form.Item>

            <Divider orientation="left">Courses</Divider>

            <Form.Item>
                {Object.keys(config)
                    .filter((key) => key.startsWith('course:'))
                    .map((id) => (
                        <CourseItem key={id} id={id} onDelete={deleteCourse} />
                    ))}
                <p className="mb-1 font-bold">添加新课程</p>
                <p className="mb-1 dark:text-gray-200 text-gray-800 opacity-50">不要含有空格</p>
                <Space>
                    <Input addonBefore="course:" value={newCourseId} onChange={(e) => setNewCourseId(e.target.value)} />
                    <Button onClick={addCourse}>添加课程</Button>
                </Space>
            </Form.Item>

            <Divider orientation="left">Mutex</Divider>
            <Form.Item>
                {Object.keys(config)
                    .filter((key) => key.startsWith('mutex:'))
                    .map((id) => (
                        <MutexItem key={id} id={id} onDelete={deleteMutex} courseOptions={courseOptions} />
                    ))}

                <p className="mb-1 font-bold">添加新互斥规则</p>
                <p className="mb-1 dark:text-gray-200 text-gray-800 opacity-50">不要含有空格</p>
                <Space>
                    <Input addonBefore="mutex:" value={newMutexId} onChange={(e) => setNewMutexId(e.target.value)} />
                    <Button onClick={addMutex}>添加互斥规则</Button>
                </Space>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="bg-blue-500">
                    下载
                </Button>
            </Form.Item>
        </Form>
    );
};
