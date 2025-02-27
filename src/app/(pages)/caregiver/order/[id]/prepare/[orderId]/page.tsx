import { CaregiverOrderDetails } from "@/app/(pages)/caregiver/type/data";
import { medicinePreparation } from "@/app/_server-action/caregiver";
import CustomBreadcrumbs from "@/components/Axolotl/Breadcrumbs/CustomBreadcrumbs";
import CustomLayout from "@/components/Axolotl/Layouts/CustomLayout";
import MedicinePreparation from "@/components/Caregiver/MedicinePreparation/MedicinePreparation";
import { globalFormatDate } from "@/utils/Formatters/GlobalFormatters";
import { getCaregiverMetadata } from "@/utils/Metadata/CaregiverMetadata";
import { Metadata } from "next";

export const metadata: Metadata = getCaregiverMetadata("prepare");
async function getMedicinePreparationData(id: string) {
  try {
    const data: CaregiverOrderDetails = await medicinePreparation(id);

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch medicine preparation details:", error);

    return null;
  }
}

function calculateEndTime(
  appointmentDate: Date,
  dayOfVisit: number,
  appointmentTime: string
): string {
  const [hours, minutes] = appointmentTime.split(":");
  const startDate = new Date(appointmentDate);
  startDate.setHours(parseInt(hours), parseInt(minutes));

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + dayOfVisit);

  return globalFormatDate(endDate, "shortDate") + " / " + appointmentTime;
}

const MedicinePreparationPage = async ({
  params
}: {
  params: { orderId: string };
}) => {
  const orderData = await getMedicinePreparationData(params.orderId);

  if (!orderData) {
    throw new Error("Failed to fetch order data");
  }

  // Extract user and patient data from orderData
  const user = orderData.patient?.users;
  const patientId = orderData.patient?.id;
  const first_name = user?.first_name;
  const last_name = user?.last_name;
  const address = user?.address;
  const phone_number = user?.phone_number;
  const birthdate = user?.birthdate;
  const allergies = orderData.patient?.allergies;
  const blood_type = orderData.patient?.blood_type;
  const height = orderData.patient?.height;
  const weight = orderData.patient?.weight;
  const isSmoking = orderData.patient?.is_smoking;
  const current_medication = orderData.patient?.current_medication;
  const med_freq_times = orderData.patient?.med_freq_times;
  const med_freq_day = orderData.patient?.med_freq_day;
  const illness_history = orderData.patient?.illness_history;

  return (
    <CustomLayout>
      <CustomBreadcrumbs parentPage="Order" pageName="Medicine Preparation" />

      <h1 className="text-gray-text-black mb-6 text-5xl font-bold">
        Preparing Medicine...
      </h1>
      <div>
        <MedicinePreparation
          orderId={params.orderId}
          orderStatus={orderData.status}
          patientInfo={{
            id: patientId,
            name: `${first_name} ${last_name}`,
            address: address,
            phoneNumber: phone_number,
            birthdate: birthdate,
            allergies: allergies ?? "-",
            bloodType: blood_type,
            height: height.toString(),
            weight: weight.toString(),
            isSmoking: isSmoking,
            currentMedication: current_medication ?? "Not Available",
            medFreqTimes:
              med_freq_times?.toString() ??
              "This patient is currently not taking any medication.",
            medFreqDay:
              med_freq_day?.toString() ??
              "This patient is currently not taking any medication.",
            illnessHistory: illness_history ?? "Not Available"
          }}
          medicalDetails={{
            causes: orderData.appointment?.causes,
            mainConcerns: orderData.appointment?.main_concern,
            currentMedicine:
              orderData.appointment?.current_medication ?? "Not Available",
            symptoms:
              Array.isArray(orderData.appointment?.symptoms) &&
              orderData.appointment.symptoms.length > 0
                ? orderData.appointment.symptoms
                : [],
            medicalDescriptions:
              orderData.appointment?.medical_description ?? "Not Available",
            conjectures: orderData.appointment?.diagnosis ?? "Not Available"
          }}
          serviceDetails={{
            orderId: `#${orderData.id}`,
            orderDate: orderData.created_at
              ? orderData.created_at.toString()
              : "Not Available",
            serviceType: orderData.appointment?.service_type ?? "Not Available",
            totalDays: orderData.appointment?.day_of_visit,
            startTime:
              globalFormatDate(
                new Date(orderData.appointment.appointment_date),
                "shortDate"
              ) +
              " / " +
              orderData.appointment?.appointment_time,
            endTime: calculateEndTime(
              orderData.appointment.appointment_date,
              orderData.appointment?.day_of_visit || 0,
              orderData.appointment.appointment_time
            ),
            serviceFee: orderData.appointment.total_payment,
            totalCharge: orderData.total_payment
          }}
          price={{
            total: orderData.medicineOrder?.sub_total_medicine || 0,
            delivery: orderData.medicineOrder?.delivery_fee || 0,
            totalCharge: orderData.total_payment || 0
          }}
          rate={orderData.rate}
        />
      </div>
    </CustomLayout>
  );
};

export default MedicinePreparationPage;
