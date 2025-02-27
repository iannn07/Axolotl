import OrderPage from "@/components/Caregiver/OrderHistory";
import { getCaregiverMetadata } from "@/utils/Metadata/CaregiverMetadata";
import React from "react";

export const metadata = getCaregiverMetadata("order history");
const page = () => {
  return <OrderPage />;
};

export default page;
