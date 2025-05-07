import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { UserHeader } from "../../components/layouts/userHeader";
import { UserFooter } from "../../components/layouts/userFooter";

interface LayoutProps {
  children?: ReactNode;
}

const Layouts: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader />
      <main className="flex-grow">
        { <Outlet />}
      </main>
      <UserFooter />
    </div>
  );
};

export default Layouts;