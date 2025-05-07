import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { fetchAllTutors, getLanguages } from "../../../services/userAuth"
import type { RootState } from "../../../redux/store"
import type { ILanguage } from "../../../interfaces/admin"

interface Tutor {
  _id?: string
  is_blocked: boolean | null
  name?: string
  profilePicture?: string
  language?: string 
  rating?: number
  courses?: number
  specialty?: string
}

const TutorList: React.FC = () => {
  const navigate = useNavigate()
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [languages, setLanguages] = useState<ILanguage[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const selectedLanguageId = useSelector((state: RootState) => state.auth.selectedLanguageId)

  useEffect(() => {
    getLanguagesData()
    getTutors()
  }, [selectedLanguageId])

  const getLanguagesData = async () => {
    try {
      const response = await getLanguages()
      if (response.success && Array.isArray(response.data)) {
        setLanguages(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch languages:", err)
    }
  }

  const getTutors = async () => {
    setLoading(true)
    try {
      const fetchedTutors = await fetchAllTutors()
     
      const enhancedTutors = fetchedTutors.map((tutor: { specialty: any; rating: any; courses: any }) => ({
        ...tutor,
        specialty: tutor.specialty || "Grammar",
        rating: tutor.rating || (4 + Math.random()).toFixed(1),
        courses: tutor.courses || Math.floor(Math.random() * 50) + 10,
      }))
      setTutors(enhancedTutors)
    } catch (err: any) {
      setError(err.message || "Failed to fetch tutors")
      toast.error(err.message || "Failed to fetch tutors")
    } finally {
      setLoading(false)
    }
  }

  const filteredTutors = tutors.filter((tutor) => !tutor.is_blocked && tutor.language === selectedLanguageId)

  const handleChangeLanguage = () => {
    navigate("/languages", { state: { from: "/tutors" } })
  }

  const handleTutorClick = (tutorId?: string) => {
    if (!selectedLanguageId) {
      navigate("/languages", { state: { from: `/tutor/${tutorId}` } })
    } else if (tutorId) {
      navigate(`/tutorDetail/${tutorId}`)
    }
  }

  const selectedLanguageName = selectedLanguageId
    ? languages.find((lang) => lang._id === selectedLanguageId)?.name || selectedLanguageId
    : "Selected Language"

  
  // const renderStars = (rating = 0) => {
  //   const fullStars = Math.floor(rating)
  //   const hasHalfStar = rating % 1 >= 0.5

  //   return (
  //     <div className="flex items-center">
  //       {[...Array(5)].map((_, i) => (
  //         <svg
  //           key={i}
  //           className={`w-4 h-4 ${i < fullStars ? "text-yellow-400" : i === fullStars && hasHalfStar ? "text-yellow-400" : "text-gray-300"}`}
  //           fill="currentColor"
  //           viewBox="0 0 20 20"
  //         >
  //           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  //         </svg>
  //       ))}
  //       <span className="ml-1 text-sm text-gray-500">{rating}</span>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-[#f8e8e8] p-6">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Meet Language Experts</h1>

        <h2 className="text-lg text-gray-600 mb-8">Meet Our Popular Tutors for {selectedLanguageName}</h2>

        {!selectedLanguageId && (
          <div className="mb-4">
            <button
              onClick={handleChangeLanguage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select Language
            </button>
            <p className="text-yellow-600 mt-2">Please select a language to view tutors.</p>
          </div>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-gray-600 mb-4">Loading tutors...</p>}

        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.name || tutor._id}
                className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleTutorClick(tutor._id)}
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
                  {tutor.profilePicture ? (
                    <img
                      src={tutor.profilePicture || "/placeholder.svg"}
                      alt={tutor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-bold">{tutor.name?.charAt(0) || "T"}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">{tutor.name || "Unnamed Tutor"}</h3>
                <p className="text-sm text-gray-600 mb-1">{tutor.specialty}</p>
                {/* <p className="text-sm text-gray-600 mb-1">{tutor.courses} Courses</p> */}
                {/* {renderStars(Number(tutor.rating))} */}
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          selectedLanguageId && <p className="text-gray-600 text-center">No tutors found for {selectedLanguageName}.</p>
        )}

        {selectedLanguageId && (
          <div className="mt-6">
            <button
              onClick={handleChangeLanguage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Change Language
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TutorList
