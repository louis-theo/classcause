import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DonationBarChart = ({ BACKEND_URL }) => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  ); // Default to current year
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    axios
      .get(
        `${BACKEND_URL}/generalmetrics/metrics/donations-timeframe?timeframe=monthly&year=${selectedYear}`
      )
      .then((response) => {
        const formattedAndSortedData = response.data
          .map((item) => ({
            ...item,
            total: parseFloat(item.total),
            count: parseInt(item.count, 10),
          }))
          .sort((a, b) => a.period.localeCompare(b.period));

        setMonthlyData(formattedAndSortedData);
      })
      .catch((error) =>
        console.error("Error fetching monthly donation data:", error)
      );
  }, [BACKEND_URL, selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const formatXAxisTick = (tick) => {
    const date = new Date(tick);
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
    return `${months[date.getMonth()]} '${date
      .getFullYear()
      .toString()
      .slice(-2)}`;
  };

  return (
    <div>
      <select onChange={handleYearChange} value={selectedYear}>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
      </select>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tickFormatter={formatXAxisTick} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#82ca9d" name="Total Donations" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonationBarChart;
