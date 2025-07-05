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
import { Pencil, Trash2, BookOpen, Plus, Star, Users } from "lucide-react"; // Added Users icon
import SearchBar from "../../UI/SearchBar";

const ListCourse: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCourses();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCourses(currentPage, itemsPerPage, searchTerm);
      console.log("Fetched courses:", result.courses);
      setCourses(result.courses);
      setTotalCourses(result.total);
    } catch (error) {
      console.log("=================", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
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


  

  const totalPage = Math.ceil(totalCourses / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#1593A0] via-[#1CA6B3] to-[#20BCD1] rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
                <p className="text-purple-100 text-lg">
                  Create, manage and inspire with your educational content
                </p>
                <div className="flex items-center gap-4 mt-4 text-purple-100">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-sm font-medium">{totalCourses} Total Courses</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate("/tutor/addCourse")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Course
              </Button>
            </div>

            <SearchBar onSearch={setSearchTerm} placeholder="Search courses by name..." />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-8">
            {/* Stats Bar */}
            <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="text-sm font-medium text-gray-700">
                {totalCourses > 0 ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Showing {courses.length} of {totalCourses} courses
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    No courses available
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading your courses...</p>
              </div>
            ) : error ? (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div>
                {/* Card View Empty State */}
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200 mb-8">
                  <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <BookOpen className="h-16 w-16 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to start teaching?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create your first course and share your knowledge with eager learners around the world.
                  </p>
                  <Button
                    onClick={() => navigate("/tutor/addCourse")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Course
                  </Button>
                </div>

                {/* Table View Empty State */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Course</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          {searchTerm ? `No courses found matching "${searchTerm}"` : "No courses found"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {courses.map((course) => (
                  <Card
                    key={course._id || ""}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur border-0 shadow-lg"
                  >
                    <div className="relative h-56 overflow-hidden">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl || "/placeholder.svg"}
                          alt={course.courseTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
                          <BookOpen className="h-20 w-20 text-white/80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg">
                        ${course.regularPrice}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          {typeof course.category === "string"
                            ? course.category
                            : course.category?.name || "Uncategorized"}
                        </span>
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
                          {typeof course.language === "string"
                            ? course.language
                            : course.language?.name || "Unknown Language"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {course.courseTitle}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </CardContent>

                    <Separator className="bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200" />

                    <CardFooter className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                      <div className="flex justify-between items-center w-full flex-wrap gap-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course._id || "", course)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-medium"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(course._id || "")}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleLessons(course._id || "")}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-md"
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Lessons
                          </Button>
                          
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPage > 1 && (
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

                  {Array.from({ length: totalPage }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                      className={currentPage === index + 1 ? "bg-primary text-white" : "text-gray-700"}
                    >
                      {index + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPage}
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
  );
};

export default ListCourse;