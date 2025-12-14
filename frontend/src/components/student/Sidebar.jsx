import { Layout, Menu, Button } from 'antd';
import { LogoutOutlined, DashboardOutlined, UserOutlined, BookOutlined, CalendarOutlined, FileTextOutlined, DollarOutlined, BellOutlined, FormOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
  const { Sider } = Layout;

  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        link: '/dashboard',
      },
    ];

    if (user.role === 'student') {
      return [
        ...baseItems,
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Profile',
          link: '/profile',
        },
        {
          key: 'attendance',
          icon: <CalendarOutlined />,
          label: 'Attendance',
          link: '/attendance',
        },
        {
          key: 'exams',
          icon: <FileTextOutlined />,
          label: 'Exams & Results',
          link: '/exams',
        },
        {
          key: 'fees',
          icon: <DollarOutlined />,
          label: 'Fees',
          link: '/fees',
        },
        {
          key: 'lms',
          icon: <BookOutlined />,
          label: 'Learning Materials',
          link: '/lms',
        },

        {
          key: 'messages',
          icon: <BellOutlined />,
          label: 'Messages',
          link: '/messages',
        },
        {
          key: 'notices',
          icon: <BellOutlined />,
          label: 'Notices',
          link: '/notices',
        },
        {
          key: 'timetable',
          icon: <ClockCircleOutlined />,
          label: 'Class Timetable',
          link: '/timetable',
        },
      ];
    } else if (user.role === 'teacher') {
      return [
        ...baseItems,
        {
          key: 'attendance',
          icon: <CalendarOutlined />,
          label: 'Attendance',
          link: '/attendance',
        },
        {
          key: 'exams',
          icon: <FileTextOutlined />,
          label: 'Exams',
          link: '/exams',
        },
        {
          key: 'lms',
          icon: <BookOutlined />,
          label: 'Learning Materials',
          link: '/lms',
        },
        {
          key: 'timetable',
          icon: <ClockCircleOutlined />,
          label: 'Timetable',
          link: '/timetable',
        },
        {
          key: 'messages',
          icon: <BellOutlined />,
          label: 'Messages',
          link: '/messages',
        },
      ];
    } else {
      return [
        ...baseItems,
        {
          key: 'admissions',
          icon: <FormOutlined />,
          label: 'Admission Management',
          link: '/admissions',
        },
        {
          key: 'students',
          icon: <UserOutlined />,
          label: 'Students',
          link: '/students',
        },
        {
          key: 'teachers',
          icon: <TeamOutlined />,
          label: 'Teachers',
          link: '/teachers',
        },
        {
          key: 'courses',
          icon: <BookOutlined />,
          label: 'Courses',
          link: '/courses',
        },
        {
          key: 'attendance',
          icon: <CalendarOutlined />,
          label: 'Attendance',
          link: '/attendance',
        },
        {
          key: 'fees',
          icon: <DollarOutlined />,
          label: 'Fees',
          link: '/fees',
        },
        {
          key: 'messages',
          icon: <BellOutlined />,
          label: 'Messages',
          link: '/messages',
        },
      ];
    }
  };

  const menuItems = getMenuItems().map((item) => ({
    key: item.key,
    icon: item.icon,
    label: <Link to={item.link}>{item.label}</Link>,
  }));

  return (
    <Sider
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ padding: '16px', color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        ERP System
      </div>
      <Menu theme="dark" mode="inline" items={menuItems} />
      <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', padding: '16px' }}>
        <Button type="primary" danger block onClick={onLogout}>
          <LogoutOutlined /> Logout
        </Button>
      </div>
    </Sider>
  );
};

export default Sidebar;
