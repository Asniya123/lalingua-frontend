import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
  Search,
  Bell,
  Plus,
  Filter,
  Eye,
} from "lucide-react";
import { AxiosError } from "axios";

import { Button } from "../../components/UI/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/student/UI/card";
import { Input } from "../../components/UI/InputField";
import { Badge } from "../../components/UI/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/student/UI/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/UI/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/UI/Tabs";
import {
  SidebarProvider,
  SidebarInset,
} from "../../components/UI/SideBar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/UI/Dialog";
import { Star } from "lucide-react";
import AdminLayout from "../../components/layouts/adminHeader";
import { getCourseEnrolledStudents, getCourses, getDashboardStats, getTutor, getUsers } from "../../services/adminAuth";
import { CombinedUser, DashboardStats, GetTutorResponse, GetUsersResponse } from "../../interfaces/admin";
import Student from "../../interfaces/user";
import Tutor, { ICourse } from "../../interfaces/tutor";
import { IEnrolledStudent, IEnrolledStudentsResponse } from "../../interfaces/tutor";

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

      console.log("Fetching enrolled students for courseId:", courseId);

      const response: IEnrolledStudentsResponse = await getCourseEnrolledStudents(courseId);
      console.log("fetchEnrolledStudents - Response:", JSON.stringify(response, null, 2));

      if (response.success && Array.isArray(response.students)) {
        const updatedStudents = response.students.map(student => ({
          ...student,
          totalRevenue: regularPrice * 0.3,
        }));
        setEnrolledStudents(updatedStudents);
        console.log("fetchEnrolledStudents - Set enrolled students:", JSON.stringify(updatedStudents, null, 2));
      } else {
        setEnrolledStudents([]);
        setStudentsError("No students data received");
        console.warn("fetchEnrolledStudents - No students data or invalid response");
      }
    } catch (err) {
      console.error("Error fetching enrolled students:", err);
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
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "N/A";
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "N/A";
    }
  };

  const getCourseStatusDisplay = (status?: "active" | "blocked" | "published") => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getCourseStatusVariant = (status?: "active" | "blocked" | "published") => {
    if (!status) return "secondary";
    return status === "published" ? "default" : "secondary";
  };

  const getTutorNameForCourse = (course: ICourse) => {
    const tutor = allTutors.find(t => t._id === course.tutorId);
    return tutor?.name || 'Unknown';
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SidebarProvider>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
            <div className="ml-auto flex items-center gap-2 px-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-[300px] pl-8" />
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-2 p-2 pt-0"> {/* Reduced padding from p-4 to p-2 and gap from 4 to 2 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="tutors">Tutors</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-2"> {/* Reduced space-y from 4 to 2 */}
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4"> {/* Reduced gap from 4 to 2 */}
                  {dashboardStats.map((stat, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stat.value}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-600">{stat.change}</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-7"> {/* Reduced gap from 4 to 2 */}
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Users</CardTitle>
                      <CardDescription>Latest user registrations and activities (Students & Approved Tutors)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2"> {/* Reduced space-y from 4 to 2 */}
                        {recentUsers.map((user) => (
                          <div key={user._id || user.id} className="flex items-center space-x-4">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={user.profilePicture ?? ""}
                                alt={user.name}
                              />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge>{user.role}</Badge>
                              <Badge variant={user.status === "Active" || user.status === "approved" ? "default" : "secondary"}>
                                {user.status === "approved" ? "Approved" : user.status}
                              </Badge>
                              {user.role === 'Tutor' && user.isVerified && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  ✓ Verified
                                </Badge>
                              )}
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
                    <CardContent className="space-y-2"> {/* Reduced space-y from 4 to 2 */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start bg-transparent" variant="outline">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Review Courses
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                              All Courses Review
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-300">
                              Review all courses and their submitted reviews with student names.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {allCourses.map((course) => (
                              <div key={course._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.courseTitle || 'Untitled'}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Tutor: {getTutorNameForCourse(course)}</p>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedCourse(course);
                                        if (course._id) {
                                          fetchEnrolledStudents(course._id, course.regularPrice || 0);
                                        }
                                      }}
                                      className="mb-2"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Reviews
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[600px] max-h-[70vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300">
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedCourse?.courseTitle || 'Untitled'} Reviews
                                      </DialogTitle>
                                      <DialogDescription className="text-gray-600 dark:text-gray-300">
                                        Reviews submitted by students for this course.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {studentsLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                          <span>Loading reviews...</span>
                                        </div>
                                      ) : studentsError ? (
                                        <p className="text-red-600">{studentsError}</p>
                                      ) : enrolledStudents.length > 0 && enrolledStudents.some(student => student.review) ? (
                                        enrolledStudents
                                          .filter(student => student.review)
                                          .map((student) => (
                                            <div
                                              key={student.id}
                                              className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-600"
                                            >
                                              <div className="flex items-center">
                                                <span className="font-medium text-gray-700 dark:text-gray-200">Student: {student.name || 'Unknown'}</span>
                                                <div className="flex ml-2">
                                                  {[...Array(5)].map((_, i) => (
                                                    <Star
                                                      key={i}
                                                      className={`h-4 w-4 ${student.review && i < student.review.rating
                                                        ? 'text-gray-600 fill-gray-600'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                    />
                                                  ))}
                                                </div>
                                              </div>
                                              {student.review?.comment && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                  Comment: {student.review.comment}
                                                </p>
                                              )}
                                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Review Date: {formatDate(student.review?.createdAt)}
                                              </p>
                                            </div>
                                          ))
                                      ) : (
                                        <p className="text-gray-600 dark:text-gray-300">No reviews submitted</p>
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

              <TabsContent value="users" className="space-y-4">
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
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={typeof user.profilePicture === 'string' ? user.profilePicture : '/placeholder.svg'} alt={user.name} />
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
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

              <TabsContent value="tutors" className="space-y-4">
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
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={tutor.profilePicture || "/placeholder.svg"} alt={tutor.name || 'Unknown'} />
                                <AvatarFallback>
                                  {(tutor.name || 'Unknown')
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{tutor.name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{tutor.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">Approved</Badge>
                            </TableCell>
                            <TableCell>{formatDate(tutor.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
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
                            <TableCell>
                              <Badge variant={getCourseStatusVariant(course.status)}>
                                {getCourseStatusDisplay(course.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(course.createdAt)}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCourse(course);
                                      if (course._id) {
                                        fetchEnrolledStudents(course._id, course.regularPrice || 0);
                                      }
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg transition-all duration-300">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {selectedCourse?.courseTitle || 'Untitled'} Details
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-600 dark:text-gray-300">
                                      Detailed information about the course, including tutor, pricing, enrolled students, and statistics.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedCourse ? (
                                    <div className="space-y-6 py-4">
                                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Course Overview</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Tutor:</span>
                                            <p className="text-gray-600 dark:text-gray-300">{getTutorNameForCourse(selectedCourse)}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Price:</span>
                                            <p className="text-gray-600 dark:text-gray-300">
                                              ${selectedCourse.regularPrice?.toLocaleString() || '0'}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Category:</span>
                                            <p className="text-gray-600 dark:text-gray-300">
                                              {typeof selectedCourse.category === 'string'
                                                ? selectedCourse.category
                                                : selectedCourse.category?.name || 'N/A'}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Language:</span>
                                            <p className="text-gray-600 dark:text-gray-300">
                                              {typeof selectedCourse.language === 'string'
                                                ? selectedCourse.language
                                                : selectedCourse.language?.name || 'N/A'}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Status:</span>
                                            <Badge variant={getCourseStatusVariant(selectedCourse.status)} className="ml-2">
                                              {getCourseStatusDisplay(selectedCourse.status)}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enrolled Students</h3>
                                        {studentsLoading ? (
                                          <div className="flex items-center justify-center py-4">
                                            <span>Loading students...</span>
                                          </div>
                                        ) : studentsError ? (
                                          <p className="text-red-600">{studentsError}</p>
                                        ) : enrolledStudents.length > 0 ? (
                                          <div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                              Total Enrolled Students: {enrolledStudents.length}
                                            </p>
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Name</TableHead>
                                                  <TableHead>Enrolled Date</TableHead>
                                                  <TableHead>Admin Revenue</TableHead>
                                                  <TableHead>Review</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {enrolledStudents.map((student) => (
                                                  <TableRow key={student.id}>
                                                    <TableCell>{student.name || 'Unknown'}</TableCell>
                                                    <TableCell>{formatDate(student.enrolledDate)}</TableCell>
                                                    <TableCell>${(student.totalRevenue || 0).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                      {student.review ? (
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() =>
                                                            setEnrolledStudents((prev) =>
                                                              prev.map((s) =>
                                                                s.id === student.id ? { ...s, showReview: !s.showReview } : s
                                                              )
                                                            )
                                                          }
                                                        >
                                                          {student.showReview ? 'Hide Review' : 'Show Review'}
                                                        </Button>
                                                      ) : (
                                                        'No Review'
                                                      )}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                            {enrolledStudents.some((student) => student.review && student.showReview) && (
                                              <div className="mt-4">
                                                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Reviews</h4>
                                                {enrolledStudents
                                                  .filter((student) => student.review && student.showReview)
                                                  .map((student) => (
                                                    <div
                                                      key={student.id}
                                                      className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-600"
                                                    >
                                                      <div className="flex items-center">
                                                        <span className="font-medium text-gray-700 dark:text-gray-200">Rating:</span>
                                                        <div className="flex ml-2">
                                                          {[...Array(5)].map((_, i) => (
                                                            <Star
                                                              key={i}
                                                              className={`h-4 w-4 ${student.review && i < student.review.rating
                                                                ? 'text-gray-600 fill-gray-600'
                                                                : 'text-gray-300 dark:text-gray-600'
                                                                }`}
                                                            />
                                                          ))}
                                                        </div>
                                                      </div>
                                                      {student.review?.comment && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                          Comment: {student.review.comment}
                                                        </p>
                                                      )}
                                                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        Review Date: {formatDate(student.review?.createdAt)}
                                                      </p>
                                                    </div>
                                                  ))}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-gray-600 dark:text-gray-300">No students enrolled</p>
                                        )}
                                      </div>

                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Course Statistics</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                          <div className="flex items-center">
                                            <Star className="h-5 w-5 text-gray-600 mr-2" />
                                            <div>
                                              <span className="font-medium text-gray-700 dark:text-gray-200">Average Rating:</span>
                                              <p className="text-gray-600 dark:text-gray-300">
                                                {typeof selectedCourse?.averageRating === 'number'
                                                  ? selectedCourse.averageRating.toFixed(1)
                                                  : '0'}{' '}
                                                / 5
                                              </p>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Total Reviews:</span>
                                            <p className="text-gray-600 dark:text-gray-300">
                                              {selectedCourse?.totalReviews || 0}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Total Students:</span>
                                            <p className="text-gray-600 dark:text-gray-300">
                                              {enrolledStudents.length || 0}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">Total Admin Revenue:</span>
                                            <p className="text-gray-600 dark:text-gray-300">
                                              ${(enrolledStudents.length * (selectedCourse.regularPrice || 0) * 0.3).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-4 text-center text-gray-600 dark:text-gray-300">
                                      Loading course details...
                                    </div>
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