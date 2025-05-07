import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, CourseBlockUnblock } from "../../services/adminAuth";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { ICourse } from "../../interfaces/tutor";
import { Button } from "../UI/Button";
import { Card, CardContent, CardFooter } from "../UI/card";
import { Separator } from "../UI/Separator";
import { Lock, Unlock, Eye, BookOpen } from "lucide-react";
import AdminLayout from "../../components/layouts/adminHeader";

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 5;

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCourses(currentPage, coursesPerPage);
      setCourses(result.courses as ICourse[]);
      setTotalCourses(result.total);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setError(axiosError.message || "Failed to load courses");
      toast.error(axiosError.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBlockCourse = async (courseId: string, currentStatus: boolean) => {
    try {
      await CourseBlockUnblock(courseId, !currentStatus); // Toggle block status
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId ? { ...course, isBlock: !currentStatus } : course
        )
      );
      toast.success(!currentStatus ? "Course blocked successfully" : "Course unblocked successfully");
    } catch (error) {
      console.error("Error updating course status:", error);
      setError("Failed to update course status");
      toast.error("Failed to update course status");
    }
  };

  const handleViewDetails = (courseId: string) => {
    if (!courseId) {
      toast.error("Course ID is required");
      return;
    }
    navigate(`/admin/courseDetails/${courseId}`);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <h1 className="text-2xl font-bold text-white">Manage Courses</h1>
            <p className="text-orange-100 mt-1">View and manage all courses</p>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-gray-500">
                {totalCourses > 0 ? (
                  <span>Showing {courses.length} of {totalCourses} courses</span>
                ) : (
                  <span>No courses available</span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>{error}</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                <p className="mt-2 text-sm text-gray-500">Courses will appear here once created</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {courses.map((course) => (
                  <Card
                    key={course._id || ""}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl || "/placeholder.svg"}
                          alt={course.courseTitle}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm">
                        ${course.regularPrice}
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {typeof course.category === "string"
                            ? course.category
                            : course.category?.name || "Uncategorized"}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                          {typeof course.language === "string"
                            ? course.language
                            : course.language?.name || "Unknown Language"}
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            course.isBlock ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                          }`}
                        >
                          {course.isBlock ? "Blocked" : "Active"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{course.courseTitle}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                    </CardContent>

                    <Separator />

                    <CardFooter className="p-4 flex justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(course._id || "")}
                          className="text-gray-700 border-gray-300 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {course.isBlock ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockCourse(course._id || "", course.isBlock)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Unlock className="h-4 w-4 mr-1" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockCourse(course._id || "", course.isBlock)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Block
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {totalCourses > coursesPerPage && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-gray-500"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.ceil(totalCourses / coursesPerPage) }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                      className={currentPage === index + 1 ? "bg-orange-500" : "text-gray-700"}
                    >
                      {index + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(totalCourses / coursesPerPage)}
                    className="text-gray-500"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseManagement;