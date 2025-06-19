// Course.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, Star, Filter } from "lucide-react";
import { Button } from "../../UI/Button";
import { Badge } from "../../UI/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "../../UI/card";
import { Input } from "../../UI/InputField";
import { getCourse, getEnrolledCourses } from "../../../services/userAuth";
import { RootState } from "../../../redux/store";
import { ICourse } from "../../../interfaces/user";
import { Icategory } from "../../../interfaces/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../UI/Select";

interface Student {
  _id: string;
}

interface Tutor {
  _id: string;
  name?: string;
  profilePicture?: string;
}

const Course: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.student) as Student | null;
  const selectedLanguageId = useSelector((state: RootState) => state.auth.selectedLanguageId);

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchBar, setSearchBar] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const limit = 6;

  const totalPages = Math.ceil(totalCourses / limit);

  useEffect(() => {
    if (user?._id) fetchEnrolledCourses();
    fetchCourses();
  }, [user, selectedLanguageId, currentPage, searchBar, selectedCategory, sortBy]);

  const fetchEnrolledCourses = async () => {
    if (!user?._id) return;
    try {
      const response = await getEnrolledCourses(user._id);
      if (response.success && Array.isArray(response.courses)) {
        setEnrolledCourses(new Set(response.courses.map((course: ICourse) => course._id)));
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCourse(
        currentPage,
        limit,
        searchBar.trim() || undefined,
        selectedCategory === "all" ? undefined : selectedCategory,
        sortBy,
        selectedLanguageId ?? undefined
      );
      console.log("Frontend Response:", response);
      if (response.success) {
        const newCourses = response.courses || [];
        const newCategories = response.category || [];
        setCourses([...newCourses]);
        setCategories([...newCategories]);
        setTotalCourses(response.total || 0); // Use actual total
        console.log("Total Courses Set:", response.total, "Total Pages:", Math.ceil(response.total / limit));

        const counts: { [key: string]: number } = { all: response.total || 0 };
        newCourses.forEach((course: ICourse) => {
          const catId =
            typeof course.category === "object" && course.category?._id
              ? course.category._id
              : course.category?.toString();
          if (catId) counts[catId] = (counts[catId] || 0) + 1;
        });
        setCategoryCounts(counts);

        console.log("State Updated:", {
          courses: newCourses.length,
          categories: newCategories.length,
          totalCourses: response.total,
          totalPages: Math.ceil(response.total / limit),
          selectedLanguageId,
          searchBar,
          selectedCategory,
          sortBy,
        });
      } else {
        setCourses([]);
        setCategories([]);
        setTotalCourses(0);
        setCategoryCounts({ all: 0 });
        setError(response.message || "No courses found for this language");
        console.log("Fetch failed, totalCourses set to 0");
      }
    } catch (error) {
      console.error("Fetch courses error:", error);
      setError("Failed to load courses. Please try again.");
      setTotalCourses(0);
      console.log("Error occurred, totalCourses set to 0");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      console.log("Changing page to:", page);
      setCurrentPage(page);
    }
  };

  const handleChangeLanguage = () => {
    navigate("/languages", { state: { from: "/course" } });
  };

  const handleCourseClick = (courseId: string) => {
    if (!selectedLanguageId) {
      navigate("/languages", { state: { from: `/courseDetail/${courseId}` } });
    } else {
      navigate(`/courseDetail/${courseId}`);
    }
  };

  const renderStars = (rating: string) => {
    const ratingValue = parseFloat(rating) || 0;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(ratingValue) ? "fill-amber-400 text-amber-400" : i < ratingValue ? "fill-amber-400/50 text-amber-400/50" : "fill-muted text-muted"}`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E8D7D7]">
      <div className="bg-[#8B5252] py-12 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Learn a Language, Expand Your World</h1>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Dive into interactive language courses designed to help you speak fluently.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="What do you want to learn today?"
              value={searchBar}
              onChange={(e) => setSearchBar(e.target.value)}
              className="pl-10 py-6 text-base rounded-full shadow-sm border-muted text-black"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 bg-[#E8D7D7] rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            {!selectedLanguageId && <p className="text-red-500">Please select a language.</p>}
            <Button variant="outline" onClick={handleChangeLanguage}>
              Change Language
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id} className="capitalize">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                  <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-500 font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchCourses}>
              Try Again
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-lg mb-4">No courses found.</p>
            <Button
              onClick={() => {
                setSearchBar("");
                setSelectedCategory("all");
                setSortBy("popular");
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => {
                console.log("Rendering course:", course)
                const isEnrolled = enrolledCourses.has(course._id);
                return (
                  <Card key={course._id} className="group overflow-hidden hover:shadow-lg border-muted/60">
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={course.imageUrl || "/placeholder.svg"}
                        alt={course.courseTitle || "Untitled Course"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {course.category && (
                        <Badge className="absolute top-3 left-3 bg-primary/90">
                          {typeof course.category === "object" ? course.category.name : "Uncategorized"}
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary">
                        {course.courseTitle || "Untitled Course"}
                      </h3>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {course.description || "Follow these easy and simple steps"}
                      </p>
                      <div className="flex items-center space-x-3 mb-3">
                        {course.tutor && course.tutor.name ? (
                          <>
                            {course.tutor.profilePicture ? (
                              <img
                                src={course.tutor.profilePicture}
                                alt={course.tutor.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-sm">{course.tutor.name.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {course.tutor.name}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">?</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Unknown Tutor</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        {renderStars(course.averageRating || "0.0")}
                        <Badge variant="outline" className="bg-primary/5 text-primary">
                          {course.ratingCount || 0} reviews
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between items-center">
                      <span className="text-xl font-bold text-primary">
                        ${course.regularPrice?.toFixed(2) || "0.00"}
                      </span>
                      {user && isEnrolled ? (
                        <Button
                          variant="outline"
                          className="bg-green-600 text-white hover:bg-green-700 px-4 py-1"
                          onClick={() => navigate("/enrolled-Courses")}
                        >
                          Enrolled
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleCourseClick(course._id)}
                          className="group-hover:bg-primary"
                        >
                          Buy Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
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
                  {Array.from({ length: totalPages }).map((_, index) => (
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
                    disabled={currentPage === totalPages}
                    className="text-gray-500"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Course;