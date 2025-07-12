import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/student/UI/card";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import posthog from "posthog-js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsTab() {
  const [eventData, setEventData] = useState<any[]>([]);

  useEffect(() => {
    // Mock fetching event counts from PostHog (replace with actual API call)
    const fetchAnalytics = async () => {
      // Example: Fetch event counts for the last 7 days
      // This is a placeholder; use PostHog's API or SDK to fetch real data
      const mockData = [
        { event: "tab_switch", count: 50 },
        { event: "view_course_details", count: 20 },
        { event: "search_input", count: 30 },
      ];
      setEventData(mockData);
    };

    fetchAnalytics();
  }, []);

  const chartData = {
    labels: eventData.map((item) => item.event),
    datasets: [
      {
        label: "Event Counts",
        data: eventData.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "User Interaction Events (Last 7 Days)" },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Platform analytics and insights</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform Analytics</CardTitle>
          <CardDescription>Detailed analytics and reporting</CardDescription>
        </CardHeader>
        <CardContent>
          {eventData.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center text-muted-foreground">Loading analytics data...</p>
          )}
          <p className="text-center text-muted-foreground mt-4">
            View detailed user interactions and system performance in PostHog.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}