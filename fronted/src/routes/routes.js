import React from "react";
import { Layout } from "../shared/components/Layout";

const HomePage = React.lazy(() => import("../features/home/components/HomePage"));
const StudentLoginPage = React.lazy(() => import("../features/auth/components/StudentLoginPaeg"));

export const routes = [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "students",
          element: <StudentLoginPage />,
        }
      ],
    },
  ]