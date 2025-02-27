import { AdminOrderMedicineLogsTable } from "@/app/(pages)/admin/order/medicine/table/data";
import { AdminOrderServiceLogsTable } from "@/app/(pages)/admin/order/service/table/data";
import { getGlobalUserProfilePhoto } from "@/app/_server-action/global";
import { getServerPublicStorageURL } from "@/app/_server-action/global/storage/server";
import CustomDivider from "@/components/Axolotl/CustomDivider";
import {
  globalFormatDate,
  globalFormatPrice
} from "@/utils/Formatters/GlobalFormatters";
import { AxolotlServices } from "@/utils/Services";
import { IconStarFilled, IconX } from "@tabler/icons-react";
import Image from "next/image";

interface ViewOrderDetailsProps {
  orderType: "service" | "medicine";
  data: AdminOrderServiceLogsTable | AdminOrderMedicineLogsTable;
}

interface StatusDisplayProps {
  borderColor: string;
  bgColor: string;
  textColor: string;
}

function renderFields(fieldName: string[], fieldValue: string[]) {
  return (
    <div className="flex items-center">
      <div className="flex w-75 flex-col gap-2">
        {fieldName.map((field, index) => (
          <p key={index} className="font-medium">
            {field}
          </p>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {fieldValue.map((value, index) => (
          <p key={index}>{value}</p>
        ))}
      </div>
    </div>
  );
}

function calculateEndTime(
  appointmentDate: Date,
  dayOfVisit: number,
  appointmentTime: string
) {
  const [hours, minutes] = appointmentTime.split(":");
  const startDate = new Date(appointmentDate);
  startDate.setHours(parseInt(hours), parseInt(minutes));

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + dayOfVisit);

  return endDate;
}

async function ViewOrderDetails({ orderType, data }: ViewOrderDetailsProps) {
  const serviceLogData = data as AdminOrderServiceLogsTable;
  const medicineLogData = data as AdminOrderMedicineLogsTable;

  const caregiver_id = serviceLogData.caregiver.users.user_id;
  const caregiver_full_name = `${serviceLogData.caregiver.users.first_name} ${serviceLogData.caregiver.users.last_name}`;
  const caregiver_employment_status = serviceLogData.caregiver.employment_type;
  const caregiver_profile_photo = await getGlobalUserProfilePhoto(
    serviceLogData.caregiver.profile_photo
  );

  const patient_id = serviceLogData.patient.users.user_id;
  const patient_full_name = `${serviceLogData.patient.users.first_name} ${serviceLogData.patient.users.last_name}`;
  const patient_address = serviceLogData.patient.users.address;
  const patient_phone_number = serviceLogData.patient.users.phone_number;

  const orderStatus = serviceLogData.status;

  const orderStartDate = new Date(serviceLogData.appointment.appointment_date);
  const orderEndDate = calculateEndTime(
    orderStartDate,
    serviceLogData.appointment.day_of_visit,
    serviceLogData.appointment.appointment_time
  );

  const serviceFee =
    AxolotlServices.find(
      (service) => service.name === serviceLogData.appointment.service_type
    )?.price || 0;

  let orderPoS = "";
  let orderRate = 0;

  if (
    orderStatus === "Completed" &&
    serviceLogData.proof_of_service &&
    serviceLogData.rate
  ) {
    orderPoS =
      (await getServerPublicStorageURL(
        "proof_of_service",
        serviceLogData.proof_of_service
      )) || "";

    orderRate = serviceLogData.rate;
  }

  /**
   * * Status Display Configurations
   */
  const orderStatusDisplay: Record<
    "Canceled" | "Ongoing" | "Completed",
    { bgColor: string }
  > = {
    Canceled: { bgColor: "bg-red" },
    Ongoing: { bgColor: "bg-yellow" },
    Completed: { bgColor: "bg-primary" }
  };

  const statusDisplay: Record<
    "Verified" | "Unverified" | "Skipped",
    StatusDisplayProps
  > = {
    Skipped: {
      borderColor: "border-red",
      bgColor: "bg-red-light",
      textColor: "text-red"
    },
    Unverified: {
      borderColor: "border-yellow",
      bgColor: "bg-yellow-light",
      textColor: "text-yellow"
    },
    Verified: {
      borderColor: "border-primary",
      bgColor: "bg-kalbe-ultraLight",
      textColor: "text-primary"
    }
  };

  const orderStatusDisplayConfig =
    orderStatusDisplay[orderStatus as "Canceled" | "Ongoing" | "Completed"];

  /**
   * * Formatted Dates and Price
   */
  const formattedCaregiverReviewDate = globalFormatDate(
    serviceLogData.caregiver.reviewed_at,
    "longDate"
  );

  const formattedPatientBirthdate = globalFormatDate(
    serviceLogData.patient.users.birthdate,
    "longDate"
  );

  const formattedOrderDate = globalFormatDate(
    serviceLogData.created_at,
    "longDate"
  );

  const formattedOrderCompletedAt = globalFormatDate(
    serviceLogData.completed_at,
    "longDate"
  );

  const formattedAppointmentPaidAt = globalFormatDate(
    serviceLogData.appointment.paid_at,
    "longDate"
  );

  const formattedOrderStartDate = globalFormatDate(orderStartDate, "longDate");
  const formattedOrderEndDate = globalFormatDate(orderEndDate, "longDate");

  const formattedServiceFee = globalFormatPrice(serviceFee);
  const formattedServiceTotalPayment = globalFormatPrice(
    serviceLogData.appointment.total_payment
  );

  let medicineTotalQty = 0;
  let medicineSubTotalPrice = 0;
  let medicineDeliveryFee = 0;
  let medicineTotalPrice = 0;

  let medicinePaymentStatus: StatusDisplayProps = {
    borderColor: "",
    bgColor: "",
    textColor: ""
  };

  let medicinePaidAt = new Date();

  if (orderType === "medicine" && medicineLogData.medicineOrder) {
    medicineTotalQty = medicineLogData.medicineOrder.total_qty;
    medicineSubTotalPrice = medicineLogData.medicineOrder.sub_total_medicine;
    medicineDeliveryFee = medicineLogData.medicineOrder.delivery_fee;
    medicineTotalPrice = medicineLogData.medicineOrder.total_price;

    medicinePaymentStatus =
      statusDisplay[medicineLogData.medicineOrder.is_paid];

    medicinePaidAt = medicineLogData.medicineOrder.paid_at || new Date();
  }

  const formattedMedicineSubTotalPrice = globalFormatPrice(
    medicineSubTotalPrice
  );
  const formattedMedicineDeliveryFee = globalFormatPrice(medicineDeliveryFee);
  const formattedMedicineTotalPrice = globalFormatPrice(medicineTotalPrice);
  const formattedMedicinePaidAt = globalFormatDate(
    new Date(medicinePaidAt),
    "longDate"
  );

  return (
    <>
      {/* Container */}
      <div className="flex w-full justify-between gap-10">
        {/* Left Side */}
        <div className="w-[65%]">
          <div className="flex w-full flex-col gap-10">
            {/* Order Status */}
            <div className="flex w-full flex-col gap-2">
              <h1 className="text-heading-6 font-medium">Order Status</h1>
              <div className="flex items-center">
                <p className="w-50 font-medium">Current Status</p>
                <p
                  className={`rounded-full px-3 py-2 font-bold text-white ${orderStatusDisplayConfig.bgColor}`}
                >
                  {orderStatus}
                </p>
              </div>
              {/* Canceled */}
              {orderStatus === "Canceled" && (
                <div className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-red bg-red-light p-5 text-center text-red">
                  <IconX
                    size={60}
                    className="rounded-full bg-red p-2 text-red-light"
                  />
                  <h1 className="text-heading-5 font-bold">
                    This order has been canceled
                  </h1>
                  <h1 className="text-lg font-medium">
                    The system has processed the refund to the patient&apos;s
                    virtual account. <br />
                    If it doesn&apos;t show up soon, blame it on the bank&apos;s
                    hamster-powered servers.
                  </h1>
                  <div className="w-full text-left">
                    <p>
                      This Caregiver{" "}
                      <span className="font-medium">
                        has rejected this order
                      </span>{" "}
                      due to the following reasons:
                    </p>
                    <ol className="list-disc pl-5">
                      <li>{serviceLogData.notes}</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Completed */}
              {orderStatus === "Completed" && (
                <>
                  <div className="flex items-center">
                    <p className="w-50 font-medium">Completed At</p>
                    <p>{formattedOrderCompletedAt}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="w-50 font-medium">Order Rating</p>
                    <div className="flex items-center gap-3">
                      <IconStarFilled className="text-yellow" />
                      <p>{orderRate}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Caregiver Information */}
            <div className="flex w-full flex-col gap-2">
              <h1 className="text-heading-6 font-medium">
                Caregiver Information
              </h1>
              <div className="my-5 flex w-full items-center justify-center">
                <div
                  className={`h-30 w-30 overflow-hidden rounded-full border`}
                >
                  <Image
                    src={
                      caregiver_profile_photo ??
                      "/images/user/Default Caregiver Photo.png"
                    }
                    alt="User Profile Photo"
                    width={100}
                    height={100}
                    priority
                    className={`h-full w-full object-cover`}
                  />
                </div>
              </div>
              {renderFields(
                [
                  "Caregiver ID",
                  "Caregiver Name",
                  "Caregiver Employment Status",
                  "Caregiver Review Date"
                ],
                [
                  caregiver_id,
                  caregiver_full_name,
                  caregiver_employment_status,
                  formattedCaregiverReviewDate
                ]
              )}
            </div>

            {/* Patient Information */}
            <div className="flex w-full flex-col gap-2">
              <h1 className="text-heading-6 font-medium">
                Patient Information
              </h1>
              {renderFields(
                [
                  "Patient ID",
                  "Patient Name",
                  "Patient Address",
                  "Patient Phone Number",
                  "Patient Birthdate"
                ],
                [
                  patient_id,
                  patient_full_name,
                  patient_address,
                  patient_phone_number,
                  formattedPatientBirthdate
                ]
              )}
            </div>

            {/* Medical Concerns */}
            <div className="flex w-full flex-col gap-2">
              <h1 className="text-heading-6 font-medium">Medical Concerns</h1>
              {renderFields(
                ["Causes", "Main Concerns", "Current Medicine"],
                [
                  serviceLogData.appointment.causes,
                  serviceLogData.appointment.main_concern,
                  serviceLogData.appointment.current_medication
                ]
              )}
              <div className="flex">
                <div className="flex w-75 flex-col gap-2">
                  <p className="font-medium">Symptoms</p>
                </div>
                <ol className="list-decimal pl-5">
                  {serviceLogData.appointment.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-col">
                <div className="flex w-75 flex-col gap-2">
                  <p className="font-medium">Medical Description</p>
                </div>
                <p>{serviceLogData.appointment.medical_description}</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className=" w-full rounded-t-md border border-primary bg-green-light py-2 text-white">
                  <p className="font-bold">Conjecture</p>
                </div>
                <div className="w-full rounded-b-md border border-primary py-2 font-bold text-primary">
                  <p>
                    {(serviceLogData.appointment.diagnosis ??
                      "Something Wrong Here...") ||
                      "Please ask the patient for more information"}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="flex w-full flex-col gap-2">
              <h1 className="text-heading-6 font-medium">Service Details</h1>
              {renderFields(
                ["Order ID", "Order Date"],
                [serviceLogData.id, formattedOrderDate]
              )}
              <CustomDivider horizontal color="black" />
              {renderFields(
                [
                  "Service Type",
                  "Total Days of Visit",
                  "Start Date/Time",
                  "End Date/Time",
                  "Service Fee",
                  "Total Appointment Charge"
                ],
                [
                  serviceLogData.appointment.service_type,
                  `${serviceLogData.appointment.day_of_visit}x Visit`,
                  `${formattedOrderStartDate} ${serviceLogData.appointment.appointment_time}`,
                  `${formattedOrderEndDate} ${serviceLogData.appointment.appointment_time}`,
                  `${serviceLogData.appointment.day_of_visit} x ${formattedServiceFee}`,
                  formattedServiceTotalPayment
                ]
              )}
            </div>

            {/* Additional Medications */}
            {orderType === "medicine" && medicineLogData.medicineOrder && (
              <div className="flex w-full flex-col gap-2">
                <h1 className="text-heading-6 font-medium">
                  Order {medicineTotalQty}{" "}
                  {medicineTotalQty > 1 ? "Items" : "Item"}
                </h1>
                <div className="overflow-hidden rounded-md border border-primary">
                  <table className="w-full">
                    <thead>
                      <tr className=" bg-green-light text-white">
                        <th className="p-2 text-left">Quantity</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-right">Price/Item</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicineLogData.medicineOrder.medicineOrderDetail.map(
                        (med, index) => (
                          <tr key={index}>
                            <td className="border-primary p-2 text-left">
                              {med.quantity}
                            </td>
                            <td className="border-primary p-2">
                              {med.medicine.name}
                            </td>
                            <td className="border-primary p-2 text-right">
                              {globalFormatPrice(med.medicine.price)}
                            </td>
                            <td className="border-primary p-2 text-right">
                              {globalFormatPrice(med.total_price)}
                            </td>
                          </tr>
                        )
                      )}

                      <tr>
                        <td
                          colSpan={3}
                          className="border-t border-primary p-2 text-left font-bold"
                        >
                          Total Price
                        </td>
                        <td className="border-t border-primary p-2 text-right">
                          {formattedMedicineSubTotalPrice}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="border-primary p-2 text-left font-bold"
                        >
                          Delivery Fee
                        </td>
                        <td className="border-primary p-2 text-right">
                          {formattedMedicineDeliveryFee}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="rounded-bl-lg border-primary p-2 text-left font-bold"
                        >
                          Total Charge
                        </td>
                        <td className="rounded-br-lg border-primary p-2 text-right font-bold text-black">
                          {formattedMedicineTotalPrice}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-[35%]">
          <div className="flex w-full flex-col items-start justify-between gap-10">
            {/* PoS */}
            {orderPoS !== "" && (
              <div className="flex w-full flex-col gap-2 rounded-lg border-[1.5px] border-gray-1 p-5">
                <h1 className="text-center text-heading-6 font-bold text-primary">
                  Evidence
                </h1>
                <div className="flex flex-col gap-2">
                  <h1 className="font-medium">Proof of Service</h1>
                  <div className="flex justify-center">
                    <Image
                      src={orderPoS}
                      alt="Proof of Service"
                      width={200}
                      height={200}
                      priority
                      className="w-full rounded-md border-[1.5px] border-gray-1 p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Payment Status */}
            <div className="w-full rounded-lg border-[1.5px] border-gray-1 p-5">
              <h1 className="mb-3 text-center text-heading-6 font-bold text-primary">
                Service Payment
              </h1>
              {/* Payment Details */}
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full flex-col gap-1">
                  <div className="flex justify-between">
                    <p className="text-dark-secondary">Service Fee</p>
                    <p>{formattedServiceFee}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-dark-secondary">Total Days</p>
                    <p>{serviceLogData.appointment.day_of_visit}x Visit</p>
                  </div>
                </div>
                <CustomDivider horizontal />
                <div className="flex justify-between text-lg font-medium">
                  <p>Total Charge</p>
                  <p>{formattedServiceTotalPayment}</p>
                </div>
              </div>
              {/* Payment Status */}
              <div className="mt-5 flex flex-col gap-2">
                <h1 className="text-lg font-medium">Payment Status</h1>
                <div className="flex justify-between">
                  <p className="text-dark-secondary">Payment Method</p>
                  <p>Virtual Account</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-dark-secondary">Paid At</p>
                  <p>{formattedAppointmentPaidAt}</p>
                </div>
                <h1 className="rounded-md border  border-primary bg-kalbe-ultraLight px-3 py-2 text-center font-bold text-primary">
                  Verified
                </h1>
              </div>
            </div>

            {/* Medication Payment Status */}
            {orderType === "medicine" && (
              <div className="w-full rounded-lg border-[1.5px] border-gray-1 p-5">
                <h1 className="mb-3 text-center text-heading-6 font-bold text-primary">
                  Medication Payment
                </h1>
                {/* Payment Details */}
                <div className="flex w-full flex-col gap-2">
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex justify-between">
                      <p className="text-dark-secondary">
                        Total Price ({medicineLogData.medicineOrder.total_qty}{" "}
                        items)
                      </p>
                      <p>{formattedMedicineSubTotalPrice}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-dark-secondary">Delivery Fee</p>
                      <p>{formattedMedicineDeliveryFee}</p>
                    </div>
                  </div>
                  <CustomDivider horizontal />
                  <div className="flex justify-between text-lg font-medium">
                    <p>Total Charge</p>
                    <p>{formattedMedicineTotalPrice}</p>
                  </div>
                </div>
                {/* Payment Status */}
                <div className="mt-5 flex flex-col gap-2">
                  <h1 className="text-lg font-medium">Payment Status</h1>
                  <div className="flex justify-between">
                    <p className="text-dark-secondary">Payment Method</p>
                    <p>Virtual Account</p>
                  </div>
                  {medicineLogData.medicineOrder.is_paid === "Verified" && (
                    <div className="flex justify-between">
                      <p className="text-dark-secondary">Paid At</p>
                      <p>{formattedMedicinePaidAt}</p>
                    </div>
                  )}
                  <h1
                    className={`rounded-md font-bold ${medicinePaymentStatus.textColor} px-3 py-2 ${medicinePaymentStatus.bgColor} border ${medicinePaymentStatus.borderColor} text-center`}
                  >
                    {medicineLogData.medicineOrder.is_paid === "Unverified"
                      ? "Awaiting for Payment"
                      : medicineLogData.medicineOrder.is_paid}
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewOrderDetails;
