"use server";

import createSupabaseServerClient from "@/lib/server";
import { MEDICINE, USER } from "@/types/AxolotlMainType";
import { unstable_noStore } from "next/cache";

/**
 * * Global Get User Data
 * @param user_id
 * @returns
 */
export async function getGlobalUserDataByUserId(user_id: string) {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);

      return null;
    }

    return data as USER;
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return null;
  }
}

/**
 * * Global Get User Profile Photo
 * ! Do not enable noStore for this function
 * @param profile_photo
 * @returns
 */
export async function getGlobalUserProfilePhoto(profile_photo: string) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data } = supabase.storage
      .from("profile_photo")
      .getPublicUrl(profile_photo);

    if (!data) {
      console.error("Error fetching profile photo");

      return null;
    }

    const profilePhotoUrl = data.publicUrl;

    return profilePhotoUrl;
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return null;
  }
}

/**
 * * Global Get User Role
 * @param user_id
 * @returns
 */
export async function getGlobalUserRole(user_id: string) {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching data:", error.message);

      return null;
    }

    return data.role;
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return null;
  }
}

/**
 * * Helper function to get caregiver data based on the table source
 * @param caregiver_id
 * @returns
 */
async function getCaregiverDataById(caregiver_id: string) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("caregiver")
      .select("*")
      .eq("caregiver_id", caregiver_id)
      .single();

    if (error) {
      console.error("Error fetching caregiver data:", error.message);

      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return { data: null, error };
  }
}

/**
 * * Helper function to get caregiver data based on the table source
 * @param user_id
 * @returns
 */
async function getUserDataById(user_id: string) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*, caregiver(*)")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);

      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return { data: null, error };
  }
}

/**
 * * Global Get Caregiver Data by Caregiver or User ID from Caregiver/User Table
 * @param caregiver_id
 * @returns
 */
export async function getGlobalCaregiverDataByCaregiverOrUserId(
  table_source: "caregiver" | "users",
  caregiver_id: string
) {
  switch (table_source) {
    case "caregiver":
      return await getCaregiverDataById(caregiver_id);
    case "users":
      return await getUserDataById(caregiver_id);
    default:
      return { data: null, error: "Invalid table source" };
  }
}

/**
 * * Get all medicine
 * @returns
 */
export async function getGlobalAllMedicine() {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();

  try {
    const { data, error } = await supabase.from("medicine").select("*");

    if (error) {
      console.error("Error fetching data:", error);

      return [];
    }

    return data as MEDICINE[];
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return [];
  }
}

/**
 * * Get all patient
 * @returns
 */
export async function getGlobalAllPatient(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: patientData, error: patientDataError } = await supabase
    .from("patient")
    .select("*") // Jika ingin kolom spesifik, sesuaikan select
    .eq("patient_id", userId)
    .single();

  if (patientDataError) {
    console.error("Error fetching patient data:", patientDataError);

    return null;
  }

  return patientData;
}
