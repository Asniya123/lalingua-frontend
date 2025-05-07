import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import TutorSidebar from "../../components/layouts/tutorHeader";


interface TutorLayoutProps {
    children?: ReactNode;
  }

const TutorLayout: React.FC<TutorLayoutProps> = () => {
    return (
      <div className="flex min-h-screen bg-[#E8D7D7]">
        <TutorSidebar />
        <main className="flex-grow p-4">
          <Outlet />
        </main>
      </div>
    );
  };

  export default TutorLayout;