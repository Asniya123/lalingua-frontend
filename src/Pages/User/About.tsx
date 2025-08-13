import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/student/UI/card"
import { Globe, Lightbulb, Users, GraduationCap, MessageSquare, Star } from "lucide-react"

// Animation variants for reusable animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const hoverVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[100vh]">
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 to-background"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div className="flex flex-col justify-center space-y-4" variants={itemVariants}>
                <div className="space-y-2">
                  <motion.h1
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                    variants={itemVariants}
                  >
                    Unlock Your World with LaLingua
                  </motion.h1>
                  <motion.p
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    variants={itemVariants}
                  >
                    Your journey to fluency starts here. We provide an immersive and engaging platform to master new
                    languages with confidence.
                  </motion.p>
                </div>
                <motion.div className="flex flex-col gap-2 min-[400px]:flex-row" variants={itemVariants}>
  <motion.div whileHover="hover" variants={hoverVariants}>
    <Link
      to="/login"
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      Start Learning Today
    </Link>
  </motion.div>
  <motion.div whileHover="hover" variants={hoverVariants}>
    <Link
      to="/course"
      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      Explore Courses
    </Link>
  </motion.div>
</motion.div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <img
                  src="src/assets/About3.jpeg"
                  width="600"
                  height="550"
                  alt="Language learning illustration"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 md:px-6 text-center">
            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl" variants={itemVariants}>
                Our Mission
              </motion.h2>
              <motion.p
                className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed"
                variants={itemVariants}
              >
                To empower individuals worldwide to connect, communicate, and thrive across cultures by making language
                learning accessible, engaging, and effective for everyone.
              </motion.p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Lightbulb, title: "Innovation", description: "Continuously evolving our methods and technology to provide the best learning experience." },
                { icon: Users, title: "Community", description: "Fostering a supportive global community where learners can practice and grow together." },
                { icon: GraduationCap, title: "Excellence", description: "Committing to high-quality content, expert instructors, and proven pedagogical approaches." },
              ].map((item) => (
                <motion.div key={item.title} variants={itemVariants} whileHover="hover" variants={hoverVariants}>
                  <Card className="p-6 flex flex-col items-center text-center">
                    <item.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-xl font-semibold mb-2">{item.title}</CardTitle>
                    <CardContent className="text-muted-foreground text-sm">{item.description}</CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Our Story Section */}
        <motion.section
          className="w-full py-12 md:py-24 lg:py-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <img
                  src="src/assets/About4.jpeg"
                  width="500"
                  height="400"
                  alt="Our story illustration"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                />
              </motion.div>
              <motion.div className="flex flex-col justify-center space-y-4" variants={itemVariants}>
                <div className="space-y-2">
                  <motion.h2
                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                    variants={itemVariants}
                  >
                    Our Story
                  </motion.h2>
                  <motion.p
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    variants={itemVariants}
                  >
                    LaLingua was founded in 2024 by a group of passionate linguists and tech enthusiasts who
                    believed that learning a new language should be an exciting and accessible adventure, not a daunting
                    task. Frustrated by traditional methods, we set out to create a platform that combines cutting-edge
                    technology with effective teaching methodologies.
                  </motion.p>
                  <motion.p
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    variants={itemVariants}
                  >
                    Since then, we've grown into a vibrant community of millions of learners worldwide, helping
                    them achieve their language goals and connect with global cultures.
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Choose Us Section */}
        <motion.section
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 md:px-6 text-center">
            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                variants={itemVariants}
              >
                Why Choose LanguageLink?
              </motion.h2>
              <motion.p
                className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed"
                variants={itemVariants}
              >
                We offer a unique blend of features designed to make your language learning journey successful and
                enjoyable.
              </motion.p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: MessageSquare, title: "Interactive Lessons", description: "Engage with dynamic exercises, real-life dialogues, and speech recognition technology." },
                { icon: Users, title: "Native Speakers", description: "Learn from certified native-speaking instructors in live classes and one-on-one sessions." },
                { icon: Star, title: "Personalized Paths", description: "Tailored learning paths that adapt to your progress and goals." },
                { icon: Globe, title: "Cultural Immersion", description: "Dive deep into the culture behind the language with curated content and cultural insights." },
                { icon: Lightbulb, title: "Progress Tracking", description: "Monitor your achievements and see your fluency grow with detailed progress reports." },
                { icon: MessageSquare, title: "Flexible Learning", description: "Learn anytime, anywhere, on any device with our mobile-friendly platform." },
              ].map((item) => (
                <motion.div key={item.title} variants={itemVariants} whileHover="hover" variants={hoverVariants}>
                  <Card className="p-6 text-left">
                    <CardHeader>
                      <item.icon className="h-8 w-8 text-primary mb-3" />
                      <CardTitle>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">{item.description}</CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          className="w-full py-12 md:py-24 lg:py-32 border-t"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 md:px-6 text-center">
            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                variants={itemVariants}
              >
                Ready to Start Your Language Journey?
              </motion.h2>
              <motion.p
                className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed"
                variants={itemVariants}
              >
                Join thousands of happy learners and unlock new opportunities.
              </motion.p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 min-[400px]:flex-row justify-center mt-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div whileHover="hover" variants={hoverVariants}>
                <Link
                  to="/register"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Sign Up for Free
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={hoverVariants}>
                <Link
                  to="/contct"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}