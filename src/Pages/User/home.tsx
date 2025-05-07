import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Image from "../../components/student/UI/image";
import { Button } from "../../components/student/UI/button";
import { Card } from "../../components/student/UI/card";
import { listLanguage } from "../../services/adminAuth";
import { ILanguage } from "../../interfaces/admin";
import Plus from "../../assets/plus.png";

interface Expert {
  name: string;
  image: string;
}

const stats = [
  { number: "100+", label: "Experienced Tutors" },
  { number: "300,000+", label: "5-star tutor reviews" },
  { number: "100+", label: "Subjects taught" },
];

export default function LanguagePage() {
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchLanguages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listLanguage();
      console.log("API Response:", response);
      if (response.success && response.data && Array.isArray(response.data.languages)) {
        setLanguages(response.data.languages);
      } else {
        setError(response.message || "Failed to fetch languages.");
      }
    } catch (err) {
      setError("Error fetching languages.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageClick = () => {
    navigate("/languages");
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8ecec]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <h1 className="text-4xl text-[#F14A00] font-bold italic tracking-wider leading-relaxed text-center">
              A language is an exact reflection of the character and growth of its speakers.
            </h1>
            <h2 className="text-2xl font-semibold">
              Which <span className="text-red-500">language</span> do you want to speak?
            </h2>

            {loading ? (
              <p>Loading languages...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {languages.slice(0, 5).map((lang) => (
                  <Button
                    key={lang._id}
                    variant="outline"
                    className="flex items-center justify-start gap-3 h-12 w-full bg-white hover:bg-gray-50"
                    onClick={handleLanguageClick}
                  >
                    <img
                      src={lang.imageUrl || "/default-flag.png"}
                      alt={`${lang.name} flag`}
                      className="w-8 h-8 rounded-sm"
                    />
                    <span className="font-medium">{lang.name}</span>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="flex items-center justify-start gap-3 h-12 w-full bg-white hover:bg-gray-50"
                  onClick={handleLanguageClick}
                >
                  <img src={Plus} alt="More languages" className="w-8 h-8 rounded-sm" />
                  <span className="font-medium">More</span>
                </Button>
              </div>
            )}
          </div>
          <div className="relative grid grid-cols-3 gap-4 aspect-square max-w-[700px] mx-auto">
            <div className="col-span-2 row-span-2">
              <Image
                src="/src/assets/home4.jpeg"
                alt="Learning experience"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src="/src/assets/home2.jpeg"
                alt="Learning illustration 1"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src="/src/assets/home3.jpeg"
                alt="Learning illustration 2"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src="/src/assets/home1.jpeg"
                alt="Learning illustration 3"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src="/src/assets/home5.jpeg"
                alt="Learning illustration 4"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 text-white bg-[#cc4f4f]">
        <p className="text-lg mb-12 font-handwriting">
          Unlock the door to endless possibilities—learn a new language today!
        </p>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video md:aspect-auto md:h-[400px]">
              <Image
                src="/src/assets/One to one.jpeg"
                alt="Tutor teaching online"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Connect with Tutors</h2>
              <p className="text-lg">
                Register to join 1-on-1 sessions with experts and enjoy 24/7 access to a supportive community, empowering
                your learning and discoveries.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen w-full grid md:grid-cols-2 items-center">
        <div className="relative w-full h-[100px] md:h-auto">
          <Image
            src="/src/assets/card image.jpeg"
            alt="People enjoying conversation at a café"
            width={300}
            height={500}
            className="object-cover"
          />
          <Card className="absolute top-8 left-8 bg-[#FFD84D] p-4 rounded-xl max-w-[240px] shadow-lg">
            <div className="flex items-start gap-3">
              <div className="space-y-1 flex-1">
                <h3 className="font-serif text-xl leading-tight">Talk about your favorite food</h3>
                <p className="text-sm">Daily Life</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Learn to speak a new language with confidence
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
            With LaLingua, you'll learn practical and useful skills that you can apply right away — so you can reach your
            goal of having real-life conversations faster.
          </p>
          <Button size="lg" className="w-fit text-lg px-8 py-6 rounded-full bg-black text-white hover:bg-black/90">
            Get started now
          </Button>
        </div>
      </div>

      <div className="min-h-screen w-full grid md:grid-cols-2 items-center">
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Learn at your own pace
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
            Achieve your goals with course material that’s tailored to your proficiency level, interests, and time
            commitment. Stay motivated with real-time feedback, progress trackers, and handy visualizations.
            It’s like having a private tutor in your pocket.
          </p>
          <Button size="lg" className="w-fit text-lg px-8 py-6 rounded-full bg-black text-white">
            Get started now
          </Button>
        </div>
        <div className="relative w-full h-[100px] md:h-auto">
          <Image
            src="/src/assets/space.jpeg"
            alt="People enjoying conversation at a café"
            width={300}
            height={500}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}