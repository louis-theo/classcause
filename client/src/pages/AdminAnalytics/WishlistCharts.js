import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatXAxisTick = (tick) => {
  const [year, month] = tick.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} '${year.slice(-2)}`;
};

const WishlistDashboard = ({ BACKEND_URL }) => {
  const [newProjectsData, setNewProjectsData] = useState([]);
  const [successRateData, setSuccessRateData] = useState([]);
  const [averageContributors, setAverageContributors] = useState(null);
  const [averageFrequency, setAverageFrequency] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newProjectsUrl = `${BACKEND_URL}/generalmetrics/api/wishlist-items/new/count-by-month`;
        const successRateUrl = `${BACKEND_URL}/generalmetrics/api/wishlist-items/success-rate/by-month`;
        const averageContributorsUrl = `${BACKEND_URL}/generalmetrics/api/wishlist-items/average-contributors`;
        const averageFrequencyUrl = `${BACKEND_URL}/generalmetrics/api/contributions/average-frequency`;

        const [
          newProjectsResponse,
          successRateResponse,
          averageContributorsResponse,
          averageFrequencyResponse,
        ] = await Promise.all([
          axios.get(newProjectsUrl),
          axios.get(successRateUrl),
          axios.get(averageContributorsUrl),
          axios.get(averageFrequencyUrl),
        ]);

        setNewProjectsData(
          newProjectsResponse.data.map((item) => ({
            period: item.period,
            count: item.count,
          }))
        );
        setSuccessRateData(
          successRateResponse.data.map((item) => ({
            period: item.period,
            successRate: parseFloat(item.successRate),
          }))
        );
        setAverageContributors(
          averageContributorsResponse.data.averageContributors
        );
        setAverageFrequency(averageFrequencyResponse.data.averageFrequency);
      } catch (error) {
        toast.error(
          `Error fetching wishlist dashboard data:${error.response.data.message}`
        );
      }
    };

    fetchData();
  }, [BACKEND_URL]);

  return (
    <div>
      <h2>New Wishlist Projects by Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={newProjectsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tickFormatter={formatXAxisTick} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="New Wishlist Projects" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Wishlist Success Rate by Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={successRateData}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tickFormatter={formatXAxisTick} />
          <YAxis domain={[0, 100]} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="successRate"
            stroke="#82ca9d"
            name="Success Rate (%)"
          />
        </LineChart>
      </ResponsiveContainer>
      {/* Display for averages */}
      <div style={{ marginTop: "20px", fontSize: "20px" }}>
        <p>
          Average Number of Contributors per Wishlist Item:{" "}
          <strong>{averageContributors}</strong>
        </p>
        <p>
          Average Number of Contributions per User:{" "}
          <strong>{averageFrequency}</strong>
        </p>
      </div>
    </div>
  );
};

export default WishlistDashboard;
