import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTenantData } from "../context/TenantContext";

const NotFound = () => {
  const completeData = useTenantData();
  const location = useLocation();
  const notFound = completeData?.notFound || {
    code: "404",
    message: "Oops! Page not found",
    returnHome: "Return to Home",
  };

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{notFound.code || "404"}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{notFound.message || "Oops! Page not found"}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {notFound.returnHome || "Return to Home"}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
