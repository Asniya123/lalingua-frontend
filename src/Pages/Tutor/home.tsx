import React, { useState, useEffect } from 'react';
import { Star, Users, Book, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { listCourses, listEnrolledStudents } from '../../services/tutorAuth';
import type { RootState } from '../../redux/store';
import Tutor, { ICourse, IEnrolledStudent, IDashboardReview } from '../../interfaces/tutor';

const TutorDashboard = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'reviews'>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const tutor = useSelector((state: RootState) => state.tutor.tutor) as Tutor | null;

  

  const fetchTutorCourses = async () => {
    if (!tutor?._id) {
     
      toast.error('Please log in to view your courses');
      return;
    }

    
    setLoading(true);

    try {
    
      const result = await listCourses(1, 10);
      
      if (!result.courses || !Array.isArray(result.courses)) {
        
        toast.error('No courses available');
        setCourses([]);
        return;
      }

      const uniqueCourses = result.courses.filter(
        (course, index, self) => course._id && self.findIndex((c) => c._id === course._id) === index
      );
      
      const allStudentsResult = await listEnrolledStudents(tutor._id!);
      
      if (!allStudentsResult.success || !Array.isArray(allStudentsResult.students)) {
        
        toast.error('Failed to load student data');
        return;
      }

      const validStudents = allStudentsResult.students || [];
     
      const studentsByCourse = new Map<string, IEnrolledStudent[]>();
      validStudents.forEach((student) => {
        const courseId = student.courseId?.toString();
        if (courseId) {
          if (!studentsByCourse.has(courseId)) studentsByCourse.set(courseId, []);
          studentsByCourse.get(courseId)!.push(student);
          
        }
      });
     

      const coursesWithStudents = uniqueCourses.map((course) => {
        const courseId = course._id?.toString();
        const courseStudents = courseId ? studentsByCourse.get(courseId) || [] : [];
        

        const studentsWithReviews = courseStudents.filter(
          (student) =>
            student.review &&
            student.review.rating !== undefined &&
            student.review.rating !== null &&
            student.review.rating > 0
        );
        

        const reviews = studentsWithReviews.map((student) => {
          const review = {
            _id: student.review!._id,
            courseId: student.courseId,
            userId: student.id,
            studentName: student.name,
            rating: student.review!.rating,
            comment: student.review!.comment,
            createdAt: student.review!.createdAt || student.enrolledDate,
          };
          
          return review as IDashboardReview;
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

        const fullRevenue = courseStudents.reduce(
          (sum, student) => sum + (student.totalRevenue || course.regularPrice || 0),
          0
        );
        const tutorRevenue = fullRevenue * 0.7;

        const courseWithData = {
          ...course,
          students: courseStudents,
          studentsEnrolled: courseStudents.length,
          totalRevenue: fullRevenue,
          tutorRevenue: tutorRevenue,
          averageRating: averageRating,
          totalReviews: totalReviews,
          studentsWithReviews: studentsWithReviews.length,
          reviews: reviews,
        };
       
        return courseWithData;
      });

      
      setCourses(coursesWithStudents);

      const totalStudents = coursesWithStudents.reduce((sum, course) => sum + course.studentsEnrolled, 0);
      const totalFullRevenue = coursesWithStudents.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);
      const totalTutorRevenue = totalFullRevenue * 0.7;
      const totalReviews = coursesWithStudents.reduce((sum, course) => sum + course.totalReviews, 0);
      const overallAverageRating = totalReviews > 0
        ? coursesWithStudents.reduce(
            (sum, course) => sum + (course.averageRating || 0) * course.totalReviews,
            0
          ) / totalReviews
        : 0;

      

      if (coursesWithStudents.length === 0) toast.info('No courses available');
      else if (totalStudents === 0) toast.info(`${coursesWithStudents.length} courses found, but no students enrolled yet`);
      else toast.success(`Dashboard loaded: ${coursesWithStudents.length} courses, ${totalStudents} students`);
    } catch (err) {
 
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tutor?._id) {
     
      fetchTutorCourses();
    }
  }, [tutor]);

  const totalStudents = React.useMemo(() => {
    const total = courses.reduce((sum, course) => sum + (course.studentsEnrolled || 0), 0);
    
    return total;
  }, [courses]);

  const totalFullRevenue = React.useMemo(() => {
    const total = courses.reduce((sum, course) => sum + (course.totalRevenue || 0), 0);
   
    return total;
  }, [courses]);

  const totalTutorRevenue = React.useMemo(() => {
    const total = totalFullRevenue * 0.7;
    
    return total;
  }, [totalFullRevenue]);

  const totalReviews = React.useMemo(() => {
    const total = courses.reduce((sum, course) => sum + (course.totalReviews || 0), 0);
   
    return total;
  }, [courses]);

  const averageRating = React.useMemo(() => {
    const totalRating = courses.reduce((sum, course) => sum + (course.averageRating || 0) * (course.totalReviews || 0), 0);
    const totalRev = courses.reduce((sum, course) => sum + (course.totalReviews || 0), 0);
    const avg = totalRev > 0 ? totalRating / totalRev : 0;
    
    return avg;
  }, [courses]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={`star-${index}`}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const CourseCard = ({ course }: { course: ICourse }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{course.courseTitle || 'Untitled Course'}</h3>
        <span className="text-green-600 font-bold">${course.regularPrice?.toFixed(2) || '0.00'}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Users className="w-4 h-4 text-blue-500 mr-2" />
          <span className="text-sm text-gray-600 font-medium">
            {course.studentsEnrolled} student{course.studentsEnrolled !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600 font-medium">${course.tutorRevenue?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-500 mr-2" />
          <span className="text-sm text-gray-600 font-medium">
            {course.averageRating?.toFixed(1) || '0.0'} ({course.totalReviews || 0} reviews)
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {renderStars(course.averageRating || 0)}
        </div>
      </div>
      <button
        onClick={() => {
          
          setSelectedCourse(course);
        }}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        View Details
      </button>
    </div>
  );

  const CourseDetails = ({ course }: { course: ICourse }) => (
    <div className="bg-white rounded-lg shadow-md mt-8">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">{course.courseTitle || 'Untitled Course'}</h2>
          <button onClick={() => setSelectedCourse(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>
       <div className="flex space-x-8 mt-4">
  <button
    onClick={() => setActiveTab('overview')}
    className={`pb-2 border-b-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
  >
    Overview
  </button>
  <button
    onClick={() => setActiveTab('students')}
    className={`pb-2 border-b-2 ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
  >
    Students ({course.studentsEnrolled})
  </button>
  <button
    onClick={() => {
      
      setActiveTab('reviews');
    }}
    className={`pb-2 border-b-2 ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
  >
    Reviews ({course.totalReviews || 0})
  </button>
</div>
      </div>
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{course.studentsEnrolled}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Original Price</p>
                  <p className="text-2xl font-bold text-green-600">${course.regularPrice?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{course.averageRating?.toFixed(1) || '0.0'} ({course.totalReviews || 0} reviews)</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Enrolled Students ({course.studentsEnrolled})</h3>
            {course.students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No students enrolled in this course yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.students.map((student, index) => (
                  <div key={student.id || `student-${index}`} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800">{student.name || 'Unknown Student'}</p>
                        {student.review && student.review.rating > 0 && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Enrolled:{' '}
                        {new Date(student.enrolledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-sm text-gray-600 mb-1">Progress</p>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(student.progress || 0, 100)}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{student.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Student Reviews & Ratings ({course.totalReviews || 0})</h3>
            {(!course.reviews || course.reviews.length === 0) ? (
              <div className="text-center py-8">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No reviews for this course yet.</p>
                <p className="text-sm text-gray-500 mt-2">Students will be able to leave reviews after completing the course.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.reviews.map((review, index) => {
                  
                  return (
                    <div key={review._id || `review-${index}`} className="border-b pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-800">{review.studentName || 'Anonymous Student'}</p>
                          <p className="text-sm text-gray-600">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {renderStars(review.rating || 0)}
                          <span className="ml-2 text-sm font-medium text-gray-700">{review.rating || 0}/5</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {tutor?.profilePicture && <img src={tutor.profilePicture} alt="Tutor Profile" className="w-12 h-12 rounded-full object-cover" />}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {tutor?.name || 'Tutor'}</h1>
              <p className="text-gray-600">Here's your teaching dashboard overview</p>
            </div>
          </div>
          <button
            onClick={() => {
             
              console.log('Current courses:', courses);
              console.log('Current tutor:', tutor);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Debug Info
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your courses...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Book className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">${totalTutorRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-800">{averageRating.toFixed(1)} ({totalReviews} reviews)</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
                <p className="text-gray-600">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-20">
                  <Book className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
                  <p className="text-gray-500">Start by creating your first course to see it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course, index) => <CourseCard key={course._id || `course-${index}`} course={course} />)}
                </div>
              )}
            </div>
          </>
        )}

        {selectedCourse && <CourseDetails course={selectedCourse} />}
      </div>
    </div>
  );
};

export default TutorDashboard;