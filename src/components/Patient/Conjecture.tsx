"use client";

import { IconAlertCircleFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import AxolotlButton from "../Axolotl/Buttons/AxolotlButton";

interface ConjectureProps {
  diagnosis: string;
  symptoms: string[];
}

const Conjecture = ({ diagnosis, symptoms }: ConjectureProps) => {
  const router = useRouter();

  return (
    <div className="mt-6 flex w-[85%] flex-col justify-between lg:flex-row">
      {/* Left Side */}
      <div className="w-[100%] p-3 lg:mr-7 lg:w-[50%]">
        <h1 className="mb-5 text-2xl font-bold">Diagnosis Conjecture</h1>
        {/* Patient Information Section */}
        <>
          <h1 className="mb-2 text-lg font-semibold">Based on your symptoms</h1>
          <h1>Symptoms</h1>
          <div className="px-5 py-2">
            <ul className="list-disc">
              <div
                className={`grid grid-flow-col ${symptoms.length > 9 ? "grid-rows-9" : "grid-rows-5"} gap-1`}
              >
                {symptoms.map((symptom: string) => (
                  <li key={symptom}>
                    {symptom[0].toUpperCase() + symptom.slice(1)}
                  </li>
                ))}
              </div>
            </ul>
          </div>

          <div className="mt-5 w-full rounded-md border border-primary">
            <div className="flex justify-center bg-kalbe-light p-3 text-lg font-semibold text-white">
              <h1>We presume that you might have</h1>
            </div>
            <h1 className="py-5 text-center font-semibold text-primary">
              {diagnosis}
            </h1>
          </div>
        </>
      </div>

      {/* Right Side */}
      <div className="w-[100%] border-stroke lg:w-[50%]">
        <div className="flex flex-col items-center justify-center gap-y-2 rounded-md border border-yellow-dark bg-orange-100 p-7 text-yellow-dark">
          <IconAlertCircleFilled color="#F09D30" size={100} />
          <h1 className="mb-3 text-center text-2xl font-bold">!! CAUTION !!</h1>
          <ul className="flex list-disc flex-col">
            <li>
              This conjecture is not a{" "}
              <span className="font-semibold">final diagnosis</span>
            </li>
            <li>
              This conjecture <span className="font-semibold">may not</span>{" "}
              fully align with your{" "}
              <span className="font-semibold">final diagnosis</span>
            </li>
            <li>
              <span className="font-semibold">Do not take any medications</span>{" "}
              before receiving a{" "}
              <span className="font-semibold">final diagnosis</span>
            </li>
          </ul>
        </div>
        <div className="mt-5 flex justify-end">
          <AxolotlButton
            label="Continue"
            variant="primary"
            isSubmit
            fontThickness="bold"
            customWidth
            customClasses="px-10"
            onClick={() => router.push("/patient/order-history")}
          />
        </div>
      </div>
    </div>
  );
};

export default Conjecture;
