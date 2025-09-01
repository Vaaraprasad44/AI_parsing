import { personalInfoApi } from "../generated/personal-info";

export const enhancedPersonalInfoApi = personalInfoApi.enhanceEndpoints({
    addTagTypes: [
        'PERSONAL_INFO', 
    ],
    endpoints: {
        parsePersonalInfoApiPersonalInfoParsePost: {
            invalidatesTags: ['PERSONAL_INFO'],
        },
    }
});

export const {
  useParsePersonalInfoApiPersonalInfoParsePostMutation,
} = enhancedPersonalInfoApi;

// Create a more user-friendly hook name
export const useParsePersonalInfoMutation = useParsePersonalInfoApiPersonalInfoParsePostMutation;