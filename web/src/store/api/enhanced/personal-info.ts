import { personalInfoApi } from "../generated/personal-info";

export const enhancedPersonalInfoApi = personalInfoApi.enhanceEndpoints({
    addTagTypes: [
        'PERSONAL_INFO', 
    ],
    endpoints: {
        parsePersonalInfoApiPersonalInfoParsePost: {
            invalidatesTags: ['PERSONAL_INFO'],
        },
        parsePersonalInfoFromImageApiPersonalInfoParseImagePost: {
            invalidatesTags: ['PERSONAL_INFO'],
        },
    }
});

export const {
  useParsePersonalInfoApiPersonalInfoParsePostMutation,
  useParsePersonalInfoFromImageApiPersonalInfoParseImagePostMutation,
} = enhancedPersonalInfoApi;

// Create more user-friendly hook names
export const useParsePersonalInfoMutation = useParsePersonalInfoApiPersonalInfoParsePostMutation;
export const useParsePersonalInfoFromImageMutation = useParsePersonalInfoFromImageApiPersonalInfoParseImagePostMutation;