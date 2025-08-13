import { Mail, Phone, MapPin} from "lucide-react"

import { Button } from "../../components/UI/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/student/UI/card"
import { Input } from "../../components/UI/InputField"
import { Label } from "../../components/UI/label"
import { Textarea } from "../../components/UI/Textarea"

export default function ContactUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-100 to-blue-100 text-gray-800 py-20 md:py-28 overflow-hidden">
  <div className="absolute inset-0 opacity-20">
    {/* Soft diagonal lines background pattern */}
    <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <pattern
        id="pattern-lines"
        width="24"
        height="24"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y="0" x2="0" y2="24" stroke="gray" strokeWidth="0.3" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#pattern-lines)" />
    </svg>
  </div>
  <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Get in Touch</h1>
    <p className="text-lg md:text-xl max-w-3xl mx-auto">
      We'd love to hear from you! Whether you have a question about our services, need support, or just want to
      say hello, our team is ready to assist.
    </p>
  </div>
</section>


      {/* Main Content Section */}
      <main className="flex-1 py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Reach Out to Us</h2>
              <p className="text-muted-foreground max-w-[600px]">
                Our dedicated team is here to provide you with the best support and information. Feel free to contact us
                through any of the methods below.
              </p>
            </div>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email Us</h3>
                  <a
                    href="mailto:support@example.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    asniya737@gmail.com
                  </a>
                  <p className="text-sm text-muted-foreground">We typically respond within 24 hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Call Us</h3>
                  <a href="tel:+1234567890" className="text-muted-foreground hover:text-primary transition-colors">
                    8301026583
                  </a>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM - 5 PM EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="w-full max-w-lg mx-auto shadow-lg border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Send Us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you promptly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Full Name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Inquiry about..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us how we can help you." className="min-h-[150px]" />
                </div>
                <Button type="submit" className="w-full py-3 text-lg">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
