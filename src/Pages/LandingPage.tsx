// import { useNavigate } from "react-router-dom"
// import { Button } from "../components/UI/Button"
// import { Input } from "../components/UI/InputField" 
// import { User, GraduationCap, Star, ArrowRight, Globe, MessageCircle, Search } from "lucide-react" 
// import { useEffect, useState } from "react"

// export default function LandingPage() {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
//   const [isLoaded, setIsLoaded] = useState(false)
//   const [searchQuery, setSearchQuery] = useState("")
//   const navigate = useNavigate()

//   useEffect(() => {
//     setIsLoaded(true)
//     const handleMouseMove = (e) => {
//       setMousePosition({ x: e.clientX, y: e.clientY })
//     }
//     window.addEventListener("mousemove", handleMouseMove)
//     return () => window.removeEventListener("mousemove", handleMouseMove)
//   }, [])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#F5F1ED] via-[#F0EBE6] to-[#F5F1ED] relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         {/* Floating Orbs */}
//         <div className="absolute top-20 left-20 w-72 h-72 bg-[#8B2635]/10 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute top-40 right-20 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#8B2635]/15 rounded-full blur-3xl animate-pulse delay-2000"></div>

//         {/* Floating Language Elements */}
//         <div className="absolute top-32 left-1/4 text-2xl animate-bounce delay-500">🌍</div>
//         <div className="absolute top-64 right-1/4 text-xl animate-bounce delay-1000">📚</div>
//         <div className="absolute bottom-32 left-1/5 text-lg animate-bounce delay-1500">💬</div>

//         {/* Grid Pattern */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(139,38,53,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,38,53,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

//         {/* Mouse Follow Effect */}
//         <div
//           className="absolute w-96 h-96 bg-gradient-radial from-[#FF6B35]/10 to-transparent rounded-full blur-3xl pointer-events-none transition-all duration-300"
//           style={{
//             left: mousePosition.x - 192,
//             top: mousePosition.y - 192,
//           }}
//         ></div>
//       </div>

//       <div className="relative z-10 min-h-screen flex flex-col">
//         {/* Main Content */}
//         <div className="flex-1 flex items-center justify-center p-4">
//           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
//             {/* Left Side - Content */}
//             <div className="space-y-8">
//               <div
//                 className={`space-y-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
//               >
//                 <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-[#8B2635] border border-[#8B2635]/20 shadow-lg">
//                   <Star className="w-4 h-4 text-[#FF6B35]" />
//                   <span>Trusted by 50,000+ learners worldwide</span>
//                 </div>

//                 <h1 className="text-4xl md:text-6xl font-bold text-[#8B2635] leading-tight">
//                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#8B2635] italic">
//                     A language is an exact reflection of
//                   </span>
//                   <br />
//                   <span className="text-[#8B2635]">the character and growth of its speakers.</span>
//                 </h1>

//                 <p className="text-xl text-[#6B4E3D] leading-relaxed">
//                   Start your journey by searching for a language or exploring our options.
//                 </p>
//               </div>

//               {/* Language Search Input */}
//               <div
//                 className={`flex w-full max-w-md items-center space-x-2 transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
//               >
//                 <Input
//                   type="text"
//                   placeholder="Search for your language..."
//                   className="flex-1 h-12 rounded-xl border-2 border-[#8B2635]/20 bg-white/80 text-[#6B4E3D] placeholder:text-[#6B4E3D]/70 focus:border-[#FF6B35] focus:ring-0 shadow-md"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 <Button className="h-12 px-6 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:from-[#E55A2B] hover:to-[#E57A32] text-white rounded-xl shadow-md">
//                   <Search className="w-5 h-5 mr-2" />
//                   Search
//                 </Button>
//               </div>
//               <button
//                 onClick={() => navigate("/languages")}
//                 className={`text-[#FF6B35] hover:text-[#E55A2B] transition-colors flex items-center space-x-2 font-medium mt-4 ${isLoaded ? "opacity-100 translate-y-0 delay-400" : "opacity-0 translate-y-10"}`}
//               >
//                 <Globe className="w-4 h-4" />
//                 <span>Explore All Languages</span>
//                 <ArrowRight className="w-4 h-4" />
//               </button>

//               {/* Role Selection Buttons */}
//               <div
//                 className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
//               >
//                 <Button
//                   className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] hover:from-[#E55A2B] hover:to-[#E57A32] text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
//                   onClick={() => navigate("/student/dashboard")}
//                 >
//                   <div className="flex items-center justify-center space-x-2">
//                     <User className="w-5 h-5" />
//                     <span>I'm a Student</span>
//                     <ArrowRight className="w-5 h-5" />
//                   </div>
//                 </Button>

//                 <Button
//                   variant="outline"
//                   className="flex-1 border-2 border-[#8B2635] text-[#8B2635] hover:bg-[#8B2635] hover:text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
//                   onClick={() => navigate("/tutor/dashboard")}
//                 >
//                   <div className="flex items-center justify-center space-x-2">
//                     <GraduationCap className="w-5 h-5" />
//                     <span>I'm a Tutor</span>
//                     <ArrowRight className="w-5 h-5" />
//                   </div>
//                 </Button>
//               </div>
//             </div>

//             {/* Right Side - Illustration */}
//             <div
//               className={`relative transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
//             >
//               <div className="relative">
//                 {/* Main illustration container */}
//                 <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
//                   <img
//                     src="/images/language-illustration.jpeg"
//                     alt="Language Learning Illustration"
//                     className="w-full h-auto rounded-2xl"
//                   />
//                 </div>

//                 {/* Floating speech bubbles */}
//                 <div className="absolute -top-4 -left-4 bg-white rounded-full p-3 shadow hint change to navigatehadow-lg animate-bounce">
//                   <MessageCircle className="w-6 h-6[text-[#FF6B35]" />
//                 </div>

//                 <div className="absolute -bottom-4 -right-4 bg-[#8B2635] text-white rounded-full p-3 shadow-lg animate-bounce delay-500">
//                   <Globe className="w-6 h-6" />
//                 </div>

//                 {/* Stats overlay */}
//                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
//                   <div className="text-2xl font-bold text-[#8B2635]">50K+</div>
//                   <div className="text-sm text-[#6B4E3D]">Active Learners</div>
//                 </div>

//                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
//                   <div className="text-2xl font-bold text-[#FF6B35]">25+</div>
//                   <div className="text-sm text-[#6B4E3D]">Languages</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="p-6 text-center">
//           <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 text-[#6B4E3D]">
//             <button
//               onClick={() => navigate("/demo")}
//               className="text-[#FF6B35] hover:text-[#E55A2B] transition-colors flex items-center space-x-2 font-medium"
//             >
//               <span>Watch Demo</span>
//               <ArrowRight className="w-4 h-4" />
//             </button>
//             <span className="hidden sm:block text-[#8B2635]/30">•</span>
//             <button
//               onClick={() => navigate("/pricing")}
//               className="text-[#8B2635] hover:text-[#7A1F2E] transition-colors flex items-center space-x-2 font-medium"
//             >
//               <span>View Pricing</span>
//               <ArrowRight className="w-4 h-4" />
//             </button>
//             <span className="hidden sm:block text-[#8B2635]/30">•</span>
//             <button
//               onClick={() => navigate("/contact")}
//               className="text-[#FF6B35] hover:text-[#E55A2B] transition-colors flex items-center space-x-2 font-medium"
//             >
//               <span>Contact Support</span>
//               <ArrowRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }