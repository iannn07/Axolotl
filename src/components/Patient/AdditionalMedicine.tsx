"use client";

import React, { useEffect, useState } from "react";
import Medicine from "./Medicine";
import AxolotlButton from "../Axolotl/Buttons/AxolotlButton";
import {
  fetchMedicineOrderById,
  handleAdditionalMedicinePayment
} from "@/app/_server-action/patient";
import {
  MEDICINE,
  MEDICINE_ORDER_DETAIL_WITH_MEDICINE
} from "@/types/AxolotlMainType";
import AxolotlModal from "../Axolotl/Modal/AxolotlModal";
import { useRouter } from "next/navigation";

interface MedicineProps {
  id: string;
  total_qty: number;
  sub_total_medicine: number;
  delivery_fee: number;
  total_price: number;
  is_paid: boolean;
  paid_at: Date;
  updated_at: Date;
  created_at: Date;
  medicine_order_detail_id: string;
  medicineOrderDetail: {
    id: string;
    quantity: number;
    total_price: number;
    created_at: Date;
    updated_at: Date;
    medicine_id: string;
    medicine: MEDICINE;
  }[];
}

const AdditionalMedicine = ({
  medicineOrder,
  payment
}: {
  medicineOrder: string;
  payment: boolean;
}) => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [medicine, setMedicine] = useState<MedicineProps>({} as MedicineProps);
  const [selection, setSelection] = useState<
    MEDICINE_ORDER_DETAIL_WITH_MEDICINE[]
  >([] as MEDICINE_ORDER_DETAIL_WITH_MEDICINE[]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(3600);

  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (payment) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (!payment && seconds !== 0) {
      () => clearInterval(interval as NodeJS.Timeout);
    }

    return () => clearInterval(interval as NodeJS.Timeout);
  }, [payment, seconds]);

  useEffect(() => {
    if (selectAll) {
      setSelection(medicine.medicineOrderDetail);
    } else {
      setSelection([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectAll]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchMedicineOrderById(medicineOrder);
      console.log("data order", data);
      setMedicine(data);

      console.log("medicine data", data.medicineOrderDetail);
    };

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmModal = () => {
    console.log("hi");
  };

  const handleAdditionalMedicine = () => {
    handleAdditionalMedicinePayment(medicineOrder, selection);
    router.back();
  };

  return (
    <div className="">
      <h1 className="mb-5 text-2xl font-semibold">Additional Medicine</h1>
      <h2 className="mb-2 text-lg font-semibold">
        Your Caregiver Recommendations
      </h2>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="w-[100%] lg:mr-7 lg:w-[65%]">
          {!medicine.is_paid && !payment && (
            <div className="mb-5.5 flex items-center justify-between rounded-md border border-stroke px-5 py-3">
              <div className="flex">
                <input
                  className="mr-2"
                  type="checkbox"
                  checked={
                    selection.length > 0
                      ? selection.length === medicine.medicineOrderDetail.length
                        ? true
                        : false
                      : false
                  }
                  onClick={() => {
                    setSelectAll(!selectAll);
                  }}
                />
                <h1 className="font-semibold">
                  Select All ({selection.length})
                </h1>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex flex-col gap-5 rounded-md border border-stroke px-5 py-7">
            {!payment && medicine.medicineOrderDetail
              ? medicine.medicineOrderDetail.map((meds, index) => (
                  <>
                    <Medicine
                      selectAll={selectAll}
                      selection={selection}
                      setSelection={setSelection}
                      medicineDetail={meds}
                      is_paid={medicine.is_paid}
                      payment={payment}
                    />
                    {index !== medicine.medicineOrderDetail.length - 1 && (
                      <div className="h-[1px] w-[100%] bg-stroke"></div>
                    )}
                  </>
                ))
              : selection.map((meds, index) => (
                  <>
                    <Medicine
                      selectAll={selectAll}
                      selection={selection}
                      setSelection={setSelection}
                      medicineDetail={meds}
                      is_paid={medicine.is_paid}
                      payment={payment}
                    />
                    {index !== selection.length - 1 && (
                      <div className="h-[1px] w-[100%] bg-stroke"></div>
                    )}
                  </>
                ))}
          </div>
        </div>

        <div className="h-[100%] w-[100%] rounded-md border border-stroke p-7 lg:w-[35%]">
          <h1 className="mb-3.5 text-center text-xl font-bold text-kalbe-light">
            Additional Payment
          </h1>
          {!payment && (
            <>
              <div>
                <div className="flex justify-between">
                  <p className="mb-1 text-dark-secondary">
                    Total Price (
                    {selection.length > 0
                      ? selection.reduce((acc, item) => acc + item.quantity, 0)
                      : 0}{" "}
                    item)
                  </p>
                  <p>
                    Rp.{" "}
                    {selection.length > 0
                      ? selection.reduce(
                          (acc, item) => acc + item.total_price,
                          0
                        )
                      : 0}
                  </p>
                </div>
                <div className="mb-3 flex justify-between">
                  <p className="mb-1 text-dark-secondary">Delivery Fee</p>
                  <p>{selection.length > 0 ? "Rp. 10000" : "Rp. 0"}</p>
                </div>
              </div>
              <div className="mb-3 h-[1px] w-[100%] bg-kalbe-light"></div>
              <div className="mb-5 flex justify-between">
                <h1>Total Charge</h1>
                <h1 className="font-semibold">
                  Rp.{" "}
                  {selection.length > 0
                    ? selection.reduce(
                        (acc, item) => acc + item.total_price,
                        0
                      ) + 10000
                    : 0}
                </h1>
              </div>
            </>
          )}

          {medicine.is_paid ? (
            <div>
              <h1 className="mb-2 text-lg font-semibold">Payment Status</h1>
              <div className="mb-3.5 rounded-[7px] border border-primary bg-kalbe-proLight p-1.5 text-center text-primary">
                <h1 className="text-lg font-semibold">Verified</h1>
              </div>
              <AxolotlButton
                label="Finish"
                onClick={() => {
                  router.back();
                }}
                variant="primary"
                fontThickness="bold"
              />
            </div>
          ) : payment ? (
            <>
              <div>
                {!isCopied && (
                  <div className="flex flex-col items-center justify-center rounded-md border-[0.5px] border-red bg-red-light px-3 py-1 text-red">
                    <h1 className="text-center text-lg font-semibold">
                      Your transaction will be automatically terminated in
                    </h1>
                    <h1 className="text-lg font-semibold">
                      {Math.floor(seconds / 3600)}:
                      {Math.floor(seconds / 60) == 60
                        ? "00"
                        : Math.floor(seconds / 60)}
                      :{seconds % 60 == 0 ? "00" : seconds % 60}
                    </h1>
                  </div>
                )}
                <div className="mb-1 mt-3 flex justify-between">
                  <h1 className="font-semibold text-stroke-dark">
                    Total Price
                  </h1>
                  <h1>
                    Rp.{" "}
                    {selection.length > 0
                      ? selection.reduce(
                          (acc, item) => acc + item.total_price,
                          0
                        )
                      : 0}
                  </h1>
                </div>
                <div className="flex justify-between">
                  <h1 className="font-semibold text-stroke-dark">
                    Delivery Fee
                  </h1>
                  <h1>Rp. 10000</h1>
                </div>
                <div className="flex justify-center">
                  <div className="my-5 h-[0.5px] w-full bg-primary"></div>
                </div>
                <div className="mb-3 flex justify-between">
                  <h1 className="font-semibold text-stroke-dark">
                    Total Charge
                  </h1>
                  <h1 className="text-lg font-bold">
                    Rp.{" "}
                    {selection.length > 0
                      ? selection.reduce(
                          (acc, item) => acc + item.total_price,
                          0
                        ) + 10000
                      : 0}
                  </h1>
                </div>
                <div className="flex flex-col items-center rounded-md border-[1px] border-stroke px-5 py-2">
                  <h1 className="mb-1 text-lg font-semibold">
                    Virtual Account Number
                  </h1>
                  <h1>12345-67890-87654</h1>
                  <button
                    className={`my-3 rounded-md ${isCopied ? "disabled bg-gray-cancel" : "bg-primary"} px-3 py-1 font-semibold text-white`}
                    onClick={async (e) => {
                      e.preventDefault();

                      try {
                        await navigator.clipboard.writeText(
                          "12345-67890-87654"
                        );
                        setIsCopied(true);
                      } catch (error) {
                        console.log("error", error);
                      }
                    }}
                  >
                    {isCopied ? "Copied" : "Copy to clipboard"}
                  </button>
                </div>
                <div>
                  <h1 className="mb-2 text-lg font-bold">Payment Status</h1>
                  {isCopied ? (
                    <div className="rounded-md border-[1px] border-primary bg-kalbe-ultraLight px-5 py-2">
                      <h1 className="text-center text-lg font-semibold text-primary">
                        Verified
                      </h1>
                    </div>
                  ) : (
                    <div className="rounded-md border-[1px] border-yellow bg-yellow-light px-5 py-2">
                      <h1 className="text-center text-lg font-semibold text-yellow">
                        Pending
                      </h1>
                    </div>
                  )}
                </div>
                <div className="mb-5 mt-5 flex w-full justify-center">
                  {isCopied ? (
                    <button
                      className={`w-full rounded-sm bg-primary p-[8px] font-medium text-white hover:bg-opacity-90`}
                      onClick={handleAdditionalMedicine}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      disabled
                      className={`w-full rounded-sm bg-gray-cancel p-[8px] font-medium text-white hover:bg-opacity-90`}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <AxolotlButton
                label="Continue to Payment"
                onClick={() =>
                  router.push(
                    `/patient/health-services/appointment/additional?medicineId=${medicineOrder}&payment=true`
                  )
                }
                variant={`${selection.length === 0 ? "secondary" : "primary"}`}
                fontThickness="bold"
                customClasses={`${selection.length === 0 && "disabled:bg-gray-cancel disabled:text-gray-cancel pointer-events-none"}`}
              />
              <AxolotlButton
                label="Skip This Step"
                onClick={() => setIsOpen(true)}
                variant="primaryOutlined"
                fontThickness="bold"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AxolotlModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmModal}
        title="Confirmation"
        question="Are you sure you want to skip this step?"
        action="skip"
      />
    </div>
  );
};

export default AdditionalMedicine;
