import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpen, Users, GraduationCap, DollarSign, Search, Bell, Eye, Star } from 'lucide-react';
import { AxiosError } from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";


import { Button } from "../../components/UI/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/student/UI/card";
import { Input } from "../../components/UI/InputField";
import { Badge } from "../../components/UI/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/student/UI/avatar"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/UI/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/UI/Tabs";
import { SidebarProvider, SidebarInset } from "../../components/UI/SideBar"; 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/UI/Dialog";

import AdminLayout from "../../components/layouts/adminHeader"; 
import { getCourseEnrolledStudents, getCourses, getDashboardStats, getEnrollmentStats, getTutor, getUsers } from "../../services/adminAuth";
import { CombinedUser, DashboardStats } from "../../interfaces/admin"; 
import Student from "../../interfaces/user"; 
import Tutor, { ICourse } from "../../interfaces/tutor";
import { IEnrolledStudent, IEnrolledStudentsResponse } from "../../interfaces/tutor";

interface ChartSection {
  labels: string[];
  counts: number[];
}

interface ChartData {
  daily: ChartSection;
  monthly: ChartSection;
  yearly: ChartSection;
}

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalStudents: 0,
    totalTutors: 0,
    totalCourses: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<CombinedUser[]>([]);
  const [allUsers, setAllUsers] = useState<Student[]>([]);
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [allCourses, setAllCourses] = useState<ICourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<IEnrolledStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Chart state with proper typing
  const [chartType, setChartType] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const [chartData, setChartData] = useState<ChartData>({
    daily: { labels: [], counts: [] },
    monthly: { labels: [], counts: [] },
    yearly: { labels: [], counts: [] },
  });
  const [chartLoading, setChartLoading] = useState(false);

  const transformStudentToCombinedUser = (student: Student): CombinedUser => {
    const profilePicture = typeof student.profilePicture === 'string' ? student.profilePicture : '/placeholder.svg';
    if (!student.profilePicture) {
      console.warn(`Missing profilePicture for student: ${student.name}`);
    } else if (student.profilePicture instanceof File) {
      console.warn(`Profile picture is a File for student: ${student.name}, using placeholder`);
    }
    return {
      _id: student._id,
      id: student.id,
      name: student.name,
      email: student.email || '',
      profilePicture: profilePicture,
      role: 'Student',
      status: student.is_verified ? 'Active' : 'Pending',
      joinDate: student.createdAt || new Date().toISOString(),
      isVerified: student.is_verified,
      createdAt: student.createdAt,
    };
  };

  const transformTutorToCombinedUser = (tutor: Tutor): CombinedUser => {
    const profilePicture = typeof tutor.profilePicture === 'string' ? tutor.profilePicture : '/placeholder.svg';
    if (!tutor.profilePicture) {
      console.warn(`Missing profilePicture for tutor: ${tutor.name}`);
    }
    return {
      _id: tutor._id,
      name: tutor.name || 'Unknown',
      email: tutor.email || '',
      profilePicture: profilePicture,
      role: 'Tutor',
      status: 'approved',
      joinDate: tutor.createdAt || new Date().toISOString(),
      isVerified: tutor.is_verified,
      createdAt: tutor.createdAt,
    };
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const response = await getEnrollmentStats();
      console.log('Raw response:', response); // Debug log
      if (!response.success) throw new Error(response.message);
      setChartData({
        daily: {
          labels: response.data.daily.map((item) => item.day),
          counts: response.data.daily.map((item) => item.count),
        },
        monthly: {
          labels: response.data.monthly.map((item) => item.month),
          counts: response.data.monthly.map((item) => item.count),
        },
        yearly: {
          labels: response.data.yearly.map((item) => item.year.toString()),
          counts: response.data.yearly.map((item) => item.count),
        },
      });
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching dashboard data...");
        const [statsData, usersData, tutorData, coursesData] = await Promise.all([
          getDashboardStats(),
          getUsers(1, 10, ""),
          getTutor(1, 10, 'approved', ""),
          getCourses(1, 10, ""),
        ]);
        console.log("Dashboard Stats Response:", JSON.stringify(statsData, null, 2));
        console.log("Users Data:", JSON.stringify(usersData, null, 2));
        console.log("Tutor Data:", JSON.stringify(tutorData, null, 2));
        console.log("Courses Data:", JSON.stringify(coursesData, null, 2));

        const updatedDashboardData = {
          totalStudents: statsData.totalStudents || 0,
          totalTutors: tutorData.totalApprovedTutors || 0,
          totalCourses: statsData.totalCourses || 0,
          totalRevenue: statsData.totalRevenue || 0,
        };
        console.log("Updated Dashboard Data:", JSON.stringify(updatedDashboardData, null, 2));
        setDashboardData(updatedDashboardData);
        setAllUsers(usersData.users || []);
        setAllTutors(tutorData.tutors.filter(tutor => tutor.status === 'approved') || []);
        setAllCourses(coursesData.courses as unknown as ICourse[] || []);

        const combinedStudents = usersData.users.map(transformStudentToCombinedUser);
        const combinedTutors = tutorData.tutors
          .filter(tutor => tutor.status === 'approved')
          .map(transformTutorToCombinedUser);
        const allCombinedUsers = [...combinedStudents, ...combinedTutors];

        const sortedUsers = allCombinedUsers.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.joinDate).getTime();
          const dateB = new Date(b.createdAt || b.joinDate).getTime();
          return dateB - dateA;
        });
        setRecentUsers(sortedUsers.slice(0, 4));
        await fetchChartData();
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const fetchEnrolledStudents = async (courseId: string, regularPrice: number) => {
    try {
      setStudentsLoading(true);
      setStudentsError(null);
      const response: IEnrolledStudentsResponse = await getCourseEnrolledStudents(courseId);
      if (response.success && Array.isArray(response.students)) {
        const updatedStudents = response.students.map(student => ({
          ...student,
          totalRevenue: regularPrice * 0.3,
        }));
        setEnrolledStudents(updatedStudents);
      } else {
        setEnrolledStudents([]);
        setStudentsError("No students data received");
      }
    } catch (err) {
      setStudentsError("Failed to load enrolled students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: loading ? "Loading..." : dashboardData.totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      change: "+12.5%",
    },
    {
      title: "Total Tutors",
      value: loading ? "Loading..." : dashboardData.totalTutors.toLocaleString(),
      icon: GraduationCap,
      color: "text-green-600",
      change: "+8.2%",
    },
    {
      title: "Total Courses",
      value: loading ? "Loading..." : dashboardData.totalCourses.toLocaleString(),
      icon: BookOpen,
      color: "text-purple-600",
      change: "+15.1%",
    },
    {
      title: "Total Revenue",
      value: loading ? "Loading..." : `$${dashboardData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
      change: "+23.4%",
    },
  ];

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCourseStatusDisplay = (status?: "active" | "blocked" | "published") => (!status ? "Draft" : status.charAt(0).toUpperCase() + status.slice(1));
  const getCourseStatusVariant = (status?: "active" | "blocked" | "published") => (!status ? "secondary" : status === "published" ? "default" : "secondary");
  const getTutorNameForCourse = (course: ICourse) => allTutors.find(t => t._id === course.tutorId)?.name || 'Unknown';

  const EnrollmentChart = () => {
    const getChartData = () => {
      let labels: string[] = [];
      let counts: number[] = [];
      let chartLabel = '';
      let backgroundColor = '';
      let borderColor = '';

      if (chartType === 'Weekly') {
        labels = chartData.daily.labels;
        counts = chartData.daily.counts;
        chartLabel = 'Weekly Enrollments';
        backgroundColor = 'rgba(44, 120, 220, 0.2)';
        borderColor = 'rgba(44, 120, 220, 1)';
      } else if (chartType === 'Monthly') {
        labels = chartData.monthly.labels;
        counts = chartData.monthly.counts;
        chartLabel = 'Monthly Enrollments';
        backgroundColor = 'rgba(4, 209, 130, 0.2)';
        borderColor = 'rgb(4, 209, 130)';
      } else if (chartType === 'Yearly') {
        labels = chartData.yearly.labels;
        counts = chartData.yearly.counts;
        chartLabel = 'Yearly Enrollments';
        backgroundColor = 'rgba(380, 200, 230, 0.2)';
        borderColor = 'rgb(380, 200, 230)';
      }

      return {
        labels,
        datasets: [{ label: chartLabel, data: counts, fill: true, backgroundColor, borderColor, tension: 0.3 }],
      };
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollment Trends</CardTitle>
          <CardDescription>Number of course enrollments over time</CardDescription>
          <div className="flex space-x-2 pt-2">
            <Button variant={chartType === 'Weekly' ? 'default' : 'outline'} onClick={() => setChartType('Weekly')} className="text-sm">Weekly</Button>
            <Button variant={chartType === 'Monthly' ? 'default' : 'outline'} onClick={() => setChartType('Monthly')} className="text-sm">Monthly</Button>
            <Button variant={chartType === 'Yearly' ? 'default' : 'outline'} onClick={() => setChartType('Yearly')} className="text-sm">Yearly</Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground"><span>Loading chart...</span></div>
          ) : getChartData().labels.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">No enrollment data available</div>
          ) : (
            <div className="h-64">
              <Line data={getChartData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { usePointStyle: true } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Number of Enrollments' } }, x: { title: { display: true, text: chartType } } } }} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen w-full">
          <div className="text-center p-4 rounded-lg shadow-md bg-background">
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SidebarProvider>
        <SidebarInset>
          
          <div className="flex flex-1 flex-col gap-4 p-0"> 
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 lg:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="tutors">Tutors</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 pt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {dashboardStats.map((stat, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1"><span className="text-green-600">{stat.change}</span> from last month</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <EnrollmentChart />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Users</CardTitle>
                      <CardDescription>Latest user registrations and activities (Students & Approved Tutors)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentUsers.map((user) => (
                          <div key={user._id || user.id} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-0.5">
                                <p className="text-base font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge>{user.role}</Badge>
                              <Badge variant={user.status === "Active" || user.status === "approved" ? "default" : "secondary"}>{user.status === "approved" ? "Approved" : user.status}</Badge>
                              {user.role === 'Tutor' && user.isVerified && <Badge variant="outline" className="text-green-600 border-green-600">✓ Verified</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Review Courses
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">All Courses Review</DialogTitle>
                            <DialogDescription>Review all courses and their submitted reviews with student names.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {allCourses.map((course) => (
                              <div key={course._id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                <h3 className="text-lg font-semibold mb-2">{course.courseTitle || 'Untitled'}</h3>
                                <p className="text-sm text-muted-foreground mb-2">Tutor: {getTutorNameForCourse(course)}</p>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => { setSelectedCourse(course); if (course._id) fetchEnrolledStudents(course._id, course.regularPrice || 0); }} className="mb-2">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Reviews
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl font-bold">{selectedCourse?.courseTitle || 'Untitled'} Reviews</DialogTitle>
                                      <DialogDescription>Reviews submitted by students for this course.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {studentsLoading ? (
                                        <div className="flex items-center justify-center py-4 text-muted-foreground"><span>Loading reviews...</span></div>
                                      ) : studentsError ? (
                                        <p className="text-red-600">{studentsError}</p>
                                      ) : enrolledStudents.length > 0 && enrolledStudents.some(student => student.review) ? (
                                        enrolledStudents.filter(student => student.review).map((student) => (
                                          <div key={student.id} className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-600">
                                            <div className="flex items-center">
                                              <span className="font-medium text-foreground">Student: {student.name || 'Unknown'}</span>
                                              <div className="flex ml-2">
                                                {[...Array(5)].map((_, i) => (
                                                  <Star key={i} className={`h-4 w-4 ${student.review && i < student.review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                                                ))}
                                              </div>
                                            </div>
                                            {student.review?.comment && <p className="text-sm text-muted-foreground mt-1">Comment: {student.review.comment}</p>}
                                            <p className="text-sm text-muted-foreground">Review Date: {formatDate(student.review?.createdAt)}</p>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-muted-foreground">No reviews submitted</p>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage students and their information</p>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all users in your platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Join Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers.map((user) => (
                          <TableRow key={user._id || user.id}>
                            <TableCell className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={typeof user.profilePicture === 'string' ? user.profilePicture : '/placeholder.svg'} alt={user.name} />
                                <AvatarFallback>{user.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tutors" className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tutor Management</h2>
                    <p className="text-muted-foreground">Manage approved tutors and their information</p>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>All Tutors</CardTitle>
                    <CardDescription>A list of all approved tutors in your platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Join Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allTutors.map((tutor) => (
                          <TableRow key={tutor._id}>
                            <TableCell className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={tutor.profilePicture || "/placeholder.svg"} alt={tutor.name || 'Unknown'} />
                                <AvatarFallback>{(tutor.name || 'Unknown').split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{tutor.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{tutor.email}</div>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="default">Approved</Badge></TableCell>
                            <TableCell>{formatDate(tutor.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Course Management</h2>
                    <p className="text-muted-foreground">Manage all courses on your platform</p>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>All Courses</CardTitle>
                    <CardDescription>A list of all courses in your platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allCourses.map((course) => (
                          <TableRow key={course._id}>
                            <TableCell className="flex items-center space-x-3">
                              <div>
                                <div className="font-medium">{course.courseTitle || 'Untitled'}</div>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant={getCourseStatusVariant(course.status)}>{getCourseStatusDisplay(course.status)}</Badge></TableCell>
                            <TableCell>{formatDate(course.createdAt)}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => { setSelectedCourse(course); if (course._id) fetchEnrolledStudents(course._id, course.regularPrice || 0); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">{selectedCourse?.courseTitle || 'Untitled'} Details</DialogTitle>
                                    <DialogDescription>Detailed information about the course, including tutor, pricing, enrolled students, and statistics.</DialogDescription>
                                  </DialogHeader>
                                  {selectedCourse ? (
                                    <div className="space-y-6 py-4">
                                      <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold mb-3">Course Overview</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                          <div><span className="font-medium text-foreground">Tutor:</span><p className="text-muted-foreground">{getTutorNameForCourse(selectedCourse)}</p></div>
                                          <div><span className="font-medium text-foreground">Price:</span><p className="text-muted-foreground">${selectedCourse.regularPrice?.toLocaleString() || '0'}</p></div>
                                          <div><span className="font-medium text-foreground">Category:</span><p className="text-muted-foreground">{typeof selectedCourse.category === 'string' ? selectedCourse.category : selectedCourse.category?.name || 'N/A'}</p></div>
                                          <div><span className="font-medium text-foreground">Language:</span><p className="text-muted-foreground">{typeof selectedCourse.language === 'string' ? selectedCourse.language : selectedCourse.language?.name || 'N/A'}</p></div>
                                          <div><span className="font-medium text-foreground">Status:</span><Badge variant={getCourseStatusVariant(selectedCourse.status)} className="ml-2">{getCourseStatusDisplay(selectedCourse.status)}</Badge></div>
                                        </div>
                                      </div>
                                      <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold mb-3">Enrolled Students</h3>
                                        {studentsLoading ? (
                                          <div className="flex items-center justify-center py-4 text-muted-foreground"><span>Loading students...</span></div>
                                        ) : studentsError ? (
                                          <p className="text-red-600">{studentsError}</p>
                                        ) : enrolledStudents.length > 0 ? (
                                          <div>
                                            <p className="text-muted-foreground mb-2">Total Enrolled Students: {enrolledStudents.length}</p>
                                            <Table>
                                              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Enrolled Date</TableHead><TableHead>Admin Revenue</TableHead><TableHead>Review</TableHead></TableRow></TableHeader>
                                              <TableBody>
                                                {enrolledStudents.map((student) => (
                                                  <TableRow key={student.id}>
                                                    <TableCell>{student.name || 'Unknown'}</TableCell>
                                                    <TableCell>{formatDate(student.enrolledDate)}</TableCell>
                                                    <TableCell>${(student.totalRevenue || 0).toLocaleString()}</TableCell>
                                                    <TableCell>{student.review ? <Button variant="ghost" size="sm" onClick={() => setEnrolledStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, showReview: !s.showReview } : s))}>{student.showReview ? 'Hide Review' : 'Show Review'}</Button> : 'No Review'}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                            {enrolledStudents.some((student) => student.review && student.showReview) && (
                                              <div className="mt-4"><h4 className="text-md font-semibold mb-2">Reviews</h4>
                                                {enrolledStudents.filter((student) => student.review && student.showReview).map((student) => (
                                                  <div key={student.id} className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-600">
                                                    <div className="flex items-center"><span className="font-medium text-foreground">Rating:</span><div className="flex ml-2">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${student.review && i < student.review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />)}</div></div>
                                                    {student.review?.comment && <p className="text-sm text-muted-foreground mt-1">Comment: {student.review.comment}</p>}
                                                    <p className="text-sm text-muted-foreground">Review Date: {formatDate(student.review?.createdAt)}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-muted-foreground">No students enrolled</p>
                                        )}
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">Course Statistics</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                          <div className="flex items-center"><Star className="h-5 w-5 text-yellow-500 mr-2" /><div><span className="font-medium text-foreground">Average Rating:</span><p className="text-muted-foreground">{typeof selectedCourse?.averageRating === 'number' ? selectedCourse.averageRating.toFixed(1) : '0'} / 5</p></div></div>
                                          <div><span className="font-medium text-foreground">Total Reviews:</span><p className="text-muted-foreground">{selectedCourse?.totalReviews || 0}</p></div>
                                          <div><span className="font-medium text-foreground">Total Students:</span><p className="text-muted-foreground">{enrolledStudents.length || 0}</p></div>
                                          <div><span className="font-medium text-foreground">Total Admin Revenue:</span><p className="text-muted-foreground">${(enrolledStudents.length * (selectedCourse.regularPrice || 0) * 0.3).toLocaleString()}</p></div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-4 text-center text-muted-foreground">Loading course details...</div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminLayout>
  );
}