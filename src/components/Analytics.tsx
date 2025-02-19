
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  weeklyData: {
    completed: number[];
    pending: number[];
  };
}

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    weeklyData: {
      completed: Array(7).fill(0),
      pending: Array(7).fill(0)
    }
  });

  useEffect(() => {
    if (user) {
      fetchTaskStats();
    }
  }, [user]);

  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      const { data: tasks, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const completedTasks = tasks?.filter(task => task.completed).length || 0;
      const totalTasks = tasks?.length || 0;
      const pendingTasks = totalTasks - completedTasks;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate weekly data
      const weeklyStats = {
        completed: Array(7).fill(0),
        pending: Array(7).fill(0)
      };

      const today = new Date();
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        return date;
      }).reverse();

      tasks?.forEach(task => {
        const taskDate = new Date(task.created_at);
        const dayIndex = last7Days.findIndex(date => 
          date.toDateString() === taskDate.toDateString()
        );
        if (dayIndex !== -1) {
          if (task.completed) {
            weeklyStats.completed[dayIndex]++;
          } else {
            weeklyStats.pending[dayIndex]++;
          }
        }
      });

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        weeklyData: weeklyStats
      });
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Completed Tasks',
        data: stats.weeklyData.completed,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: true
      },
      {
        label: 'Pending Tasks',
        data: stats.weeklyData.pending,
        borderColor: '#f56565',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#f56565',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: true
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            
          }
        }
      },
      title: {
        display: true,
        text: 'Weekly Task Progress',
        font: {
          size: 20,
          
        },
        padding: {
          top: 10,
          bottom: 30
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          
        },
        ticks: {
          stepSize: 2,
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Analytics Dashboard</h1>
      </div>
      <div className="analytics">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading analytics...</p>
          </div>
        ) : stats.totalTasks === 0 ? (
          <div className="empty-state">
            <svg
              width="200"
              height="200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a0aec0"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <line x1="12" y1="6" x2="12" y2="18" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
            <p>No tasks yet. Add tasks to see your analytics!</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Tasks</h3>
                <p>{stats.totalTasks}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p>{stats.completedTasks}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p>{stats.pendingTasks}</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <p>{stats.completionRate}%</p>
              </div>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={options} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;