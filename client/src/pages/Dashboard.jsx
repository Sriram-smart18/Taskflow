import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import MemberDashboard from '../components/dashboards/MemberDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  const isAdmin = user.role?.toLowerCase() === 'admin';

  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
};

export default Dashboard;
