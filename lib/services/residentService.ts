import { createClient } from "@/lib/supabase/browser";

interface HouseholdResident {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  hasVisitingRights: boolean;
  hasSignatoryRights: boolean;
}

interface ResidentQueryResult {
  tenant_user_id: string;
  has_visiting_rights: boolean;
  has_signatory_rights: boolean;
  tenant_user: {
    user_profile: {
      first_name: string;
      last_name: string;
    };
  } | null;
}

export type { HouseholdResident as ResidentWithProfile };

export const residentService = {
  /**
   * Get all residents for a household with their profile information
   * @param householdId - The household ID
   * @returns List of residents with first and last names
   */
  async getHouseholdResidents(
    householdId: string,
  ): Promise<HouseholdResident[]> {
    const supabase = createClient();

    // Fetch residents with user profile information
    const { data, error } = await supabase
      .from("resident")
      .select(
        `
          tenant_user_id,
          has_visiting_rights,
          has_signatory_rights,
          tenant_user:tenant_user_id (
            user_profile:user_profile_id (
              first_name,
              last_name
            )
          )
        `,
      )
      .eq("household_id", householdId);

    if (error) {
      console.error("Error fetching household residents:", error);
      throw error;
    }

    // Transform the data
    const residents: HouseholdResident[] = (data || []).map(
      (resident: unknown) => {
        const residentData = resident as ResidentQueryResult;
        const profile = residentData.tenant_user?.user_profile;
        const firstName = profile?.first_name || "";
        const lastName = profile?.last_name || "";

        return {
          id: residentData.tenant_user_id,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          hasVisitingRights: residentData.has_visiting_rights,
          hasSignatoryRights: residentData.has_signatory_rights,
        };
      },
    );

    return residents;
  },
};
