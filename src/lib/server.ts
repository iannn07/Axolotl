"use server";

import { getUserAuthSchema } from "@/app/server-action/admin/SupaAdmin";
import { USER, USER_DETAILS_AUTH_SCHEMA } from "@/types/axolotl";
import { createServerClient } from "@supabase/ssr";
import { unstable_noStore } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * * Default Supabase Server Client
 */
export default async function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        }
      }
    }
  );
}

/**
 * * Get user data from session, then fetch user data from users table
 * @returns
 */
export async function getUserFromSession() {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();
  const { data: sessionData, error } = await supabase.auth.getUser();

  if (error || !sessionData?.user) {
    return { data: null, error: error || new Error("No session found") };
  }

  const userId = sessionData.user.id;

  // Fetch the user from the database
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select()
    .eq("user_id", userId)
    .single();

  return {
    data: (userData as USER) || null,
    error: userDataError || null
  };
}

/**
 * * Helper function to fetch user data by role
 * @param user
 * @param supabase
 * @param authSchema
 * @returns
 */
async function fetchUserDataByRole(
  user: any,
  supabase: any,
  authSchema: any
): Promise<USER_DETAILS_AUTH_SCHEMA | null> {
  if (user.role === "Patient") {
    const { data: patient, error: patientError } = await supabase
      .from("users")
      .select("*, patient(*)")
      .eq("user_id", user.user_id)
      .single();

    if (patientError) {
      console.error("Error fetching patient data:", patientError.message);

      return null;
    }

    return {
      ...patient,
      email: authSchema?.email,
      patient: patient?.patient.length === 0 ? null : patient?.patient[0]
    };
  }

  if (user.role === "Nurse" || user.role === "Midwife") {
    const { data: caregiver, error: caregiverError } = await supabase
      .from("users")
      .select("*, caregiver(*)")
      .eq("user_id", user.user_id)
      .single();

    if (caregiverError) {
      console.error("Error fetching caregiver data:", caregiverError.message);

      return null;
    }

    return {
      ...caregiver,
      email: authSchema?.email,
      caregiver:
        caregiver?.caregiver.length === 0 ? null : caregiver?.caregiver[0]
    };
  }

  if (user.role === "Admin") {
    return {
      ...user,
      email: authSchema?.email
    };
  }

  return null;
}

/**
 * * Get all user detailed data from users table
 * * and its corresponding auth schema (patient or caregiver)
 * @returns
 */
export async function getUserDataFromSession() {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();
  const { data: sessionData, error } = await supabase.auth.getUser();

  if (error || !sessionData?.user) {
    return { data: null, error: error || new Error("No session found") };
  }

  const userId = sessionData.user.id;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select()
    .eq("user_id", userId)
    .single();

  if (userError) {
    console.error("Error fetching data:", userError.message);

    return null;
  }

  const authSchema = await getUserAuthSchema(userId);

  return await fetchUserDataByRole(user, supabase, authSchema);
}

/**
 * * Handle user logout
 */
export async function logout() {
  unstable_noStore();

  // Sign out locally (One Device)
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });

  // Clear session cookies server-side
  await supabase.auth.setSession({
    access_token: "",
    refresh_token: ""
  });

  redirect("/auth/signin");
}

/**
 * * Get caregiver data by user id
 * @param id
 * @returns
 */
export async function getCaregiverById(id: string) {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*, caregiver(*)")
    .eq("user_id", id);

  if (error) {
    return null;
  }

  return data;
}
