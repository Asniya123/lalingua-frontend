import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listCourses, deleteCourse } from "../../../services/tutorAuth";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { ICourse } from "../../../interfaces/tutor";
import { Button } from "../../UI/Button";
import { Card, CardContent, CardFooter } from "../../UI/card";
import { Separator } from "../../UI/Separator";
import { Pencil, Trash2, BookOpen, Plus } from "lucide-react";

const ListCourse: React.FC = () => {
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
      const result = await listCourses(currentPage, coursesPerPage);
      console.log("Fetched courses:", result.courses);
      setCourses(result.courses);
      setTotalCourses(result.total);
    } catch (error) {
      console.log('=================', error)
      const axiosError = error as AxiosError<{ message?: string }>;
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (courseId: string, course: ICourse) => {
    if (!courseId) {
      toast.error("Course ID is required for editing");
      return;
    }
    navigate(`/tutor/editCourse/${courseId}`);
  };

  const handleDelete = async (courseId: string) => {
    if (!courseId) {
      toast.error("Course ID is required for deletion");
      return;
    }
    setLoading(true);
    try {
      const result = await deleteCourse(courseId);
      toast.success(result.message);
      fetchCourses(); 
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  const handleLessons = (courseId: string) => {
    if (!courseId) {
      toast.error("Course ID is required to view lessons");
      return;
    }
    navigate(`/tutor/listLesson/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex p-6">
        <div className="flex-1 px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-6">
              <h1 className="text-2xl font-bold text-white">Your Courses</h1>
              <p className="text-blue-100 mt-1">Manage and organize your educational content</p>
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
                <Button onClick={() => navigate("/tutor/addCourse")} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Course
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
                  <p className="mt-2 text-sm text-gray-500">Get started by creating your first course</p>
                  <Button
                    onClick={() => navigate("/tutor/addCourse")}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Course
                  </Button>
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
                          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-indigo-300" />
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
                            onClick={() => handleEdit(course._id || "", course)}
                            className="text-gray-700 border-gray-300 hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(course._id || "")}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleLessons(course._id || "")}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Lessons
                        </Button>
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
                        className={currentPage === index + 1 ? "bg-indigo-600" : "text-gray-700"}
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
      </div>
    </div>
  );
};

export default ListCourse;