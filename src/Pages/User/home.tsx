import Image from "../../components/student/UI/image";
import { Button } from "../../components/student/UI/button";
import EnglishFlag from '../../assets/British.png';
import GermanFlag from '../../assets/german.png';
import ChinaFlag from '../../assets/chaina.png';
import ItalyFlag from '../../assets/italy.png';
import JapanFlag from '../../assets/japan.png';
import Plus from '../../assets/plus.png'
import { Card } from "../../components/student/UI/card";
import {UserHeader} from '../../components/layouts/userHeader'
import {UserFooter} from '../../components/layouts/userFooter'


interface Expert {
  name: string;
  image: string;
}

const stats = [
  { number: "100+", label: "Experienced Tutors" },
  { number: "300,000+", label: "5-star tutor reviews" },
  { number: "100+", label: "Subjects taught" },
];



const languages = [
  { name: "English", flag: EnglishFlag },
  { name: "German", flag: GermanFlag },
  { name: "Chinese", flag: ChinaFlag },
  { name: "Italian", flag: ItalyFlag },
  { name: "Japanese", flag: JapanFlag },
  { name: 'More', flag: Plus},
];



export default function LanguagePage() {
  return (
    <div className="min-h-screen bg-[#f8ecec]">
      <UserHeader />
      {/* Language Selection Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
          <h1 className="text-4xl text-[#F14A00] font-bold italic tracking-wider leading-relaxed text-center">
  A language is an exact reflection of the character and growth of its speakers.
</h1>


            <h2 className="text-2xl font-semibold">
              Which <span className="text-red-500">language</span> do you want to speak?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <Button
                  key={lang.name}
                  variant="outline"
                  className="flex items-center justify-start gap-3 h-12 w-full bg-white hover:bg-gray-50"
                >
                  <img
                    src={lang.flag}
                    alt={`${lang.name} flag`}
                    className="w-8 h-8 rounded-sm"
                  />
                  <span className="font-medium">{lang.name}</span>
                </Button>
              ))}
            </div>
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

      {/* Language Learning Section */}
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
  {/* Left Column */}
  <div className="relative w-full h-[100px] md:h-auto">
    <Image
      src="\src\assets\card image.jpeg"
      alt="People enjoying conversation at a café"
      width={300}  // Adjust the width as needed
      height={500} // Adjust the height as needed
      className="object-cover"
     
    />
    {/* Floating Card */}
    <Card className="absolute top-8 left-8 bg-[#FFD84D] p-4 rounded-xl max-w-[240px] shadow-lg">
      <div className="flex items-start gap-3">
        <div className="space-y-1 flex-1">
          <h3 className="font-serif text-xl leading-tight">Talk about your favorite food</h3>
          <p className="text-sm">Daily Life</p>
        </div>
        
      </div>
    </Card>
  </div>



      {/* Right Column */}
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
  {/* Left Column (Text Section) */}
  <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
      Learn at your own pace
    </h1>
    <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
    Achieve your goals with course material that’s tailored to your proficiency level, interests, and time commitment. Stay motivated with real-time feedback, progress trackers, and handy visualizations. 

It’s like having a private tutor in your pocket.


    </p>
    <Button size="lg" className="w-fit text-lg px-8 py-6 rounded-full bg-black text-white">
  Get started now
</Button>

  </div>

  {/* Right Column (Image Section) */}
  <div className="relative w-full h-[100px] md:h-auto">
    <Image
      src="\src\assets\space.jpeg"  // Corrected the path to the image
      alt="People enjoying conversation at a café"
      width={300}  // Adjust the width as needed
      height={500} // Adjust the height as needed
      className="object-cover"
   
    />
   
  </div>


  
</div>



      <UserFooter />
    </div>
  );
}
