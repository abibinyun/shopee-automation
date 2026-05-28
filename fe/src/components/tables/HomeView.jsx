import { Card, Row, Col, Statistic, Select, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import axiosInstance from '../../services/axios'; 

const { Option } = Select;

const HomeView = () => {
  const [data, setData] = useState({
    totalSoftware: 0,
    totalSoftwareVersions: 0,
    totalLicenses: 0,
    usedLicenses: 0,
    totalOrders: 0,
    softwareUsage: [],
  });

  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(false);

  const calculateDateRange = (days) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    return {
      startDate: pastDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const fetchData = async () => {
    setLoading(true);
  
    try {
      const { startDate, endDate } = calculateDateRange(Number(timeRange));
  
      const urls = [
        "/api/software/count",
        "/api/software-versions/count",
        "/api/licenses/count",
        "/api/licenses/available/all/count",
        "/api/orders/count",
        "/api/orders/usage",
      ];
  
      const requestBody = { startDate, endDate };
  
      const responses = await Promise.all(
        urls.map(url => axiosInstance.post(url, requestBody))
      );
  
      setData({
        totalSoftware: responses[0].data.totalSoftware,
        totalSoftwareVersions: responses[1].data.totalSoftwareVersions,
        totalLicenses: responses[2].data.totalLicenses,
        usedLicenses: responses[3].data.availableLicenses,
        totalOrders: responses[4].data.totalOrders,
        softwareUsage: responses[5].data,
      });
  
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const licenseData = [
    { name: 'Tersedia', value: data.usedLicenses },
    { name: 'Terpakai', value: data.totalLicenses - data.usedLicenses },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div style={{ padding: 20 }}>
      <Row justify="end" style={{ marginBottom: 20 }}>
        <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
          <Option value="7">7 Hari Terakhir</Option>
          <Option value="30">30 Hari Terakhir</Option>
          <Option value="90">90 Hari Terakhir</Option>
        </Select>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card title="Total Software">
            <Statistic value={data.totalSoftware} />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Total Versi Software">
            <Statistic value={data.totalSoftwareVersions} />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Total Lisensi">
            <Statistic value={data.totalLicenses} />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Total Order">
            <Statistic value={data.totalOrders} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Distribusi Lisensi">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={licenseData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                  {licenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Software Paling Banyak Digunakan">
            {loading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.softwareUsage}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomeView;
