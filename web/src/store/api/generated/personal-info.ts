/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    redirectToSwaggerGet: build.query<
      RedirectToSwaggerGetApiResponse,
      RedirectToSwaggerGetApiArg
    >({
      query: () => ({ url: `/` }),
    }),
    parsePersonalInfoApiPersonalInfoParsePost: build.mutation<
      ParsePersonalInfoApiPersonalInfoParsePostApiResponse,
      ParsePersonalInfoApiPersonalInfoParsePostApiArg
    >({
      query: (queryArg) => ({
        url: `/api/personal-info/parse`,
        method: "POST",
        body: queryArg.personalInfoRequest,
      }),
    }),
    parsePersonalInfoFromImageApiPersonalInfoParseImagePost: build.mutation<
      ParsePersonalInfoFromImageApiPersonalInfoParseImagePostApiResponse,
      ParsePersonalInfoFromImageApiPersonalInfoParseImagePostApiArg
    >({
      query: (queryArg) => ({
        url: `/api/personal-info/parse-image`,
        method: "POST",
        body: queryArg.bodyParsePersonalInfoFromImageApiPersonalInfoParseImagePost,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as personalInfoApi };
export type RedirectToSwaggerGetApiResponse =
  /** status 200 Successful Response */ any;
export type RedirectToSwaggerGetApiArg = void;
export type ParsePersonalInfoApiPersonalInfoParsePostApiResponse =
  /** status 200 Successful Response */ PersonalInfoResponse;
export type ParsePersonalInfoApiPersonalInfoParsePostApiArg = {
  personalInfoRequest: PersonalInfoRequest;
};
export type ParsePersonalInfoFromImageApiPersonalInfoParseImagePostApiResponse =
  /** status 200 Successful Response */ PersonalInfoResponse;
export type ParsePersonalInfoFromImageApiPersonalInfoParseImagePostApiArg = {
  bodyParsePersonalInfoFromImageApiPersonalInfoParseImagePost: BodyParsePersonalInfoFromImageApiPersonalInfoParseImagePost;
};
export type PersonalInfo = {
  /** Full name of the person as shown on ID */
  name?: string | null;
  /** Street address including number and street name */
  street?: string | null;
  /** City name */
  city?: string | null;
  /** State, province, or region */
  state?: string | null;
  /** Country name */
  country?: string | null;
  /** ZIP code or postal code */
  zip_code?: string | null;
  /** Phone number */
  phone_number?: string | null;
  /** Email address */
  email?: string | null;
  /** Date of birth from ID card */
  date_of_birth?: string | null;
  /** ID card or license number */
  id_number?: string | null;
  /** ID expiration date */
  expiration_date?: string | null;
  /** Gender as listed on ID */
  gender?: string | null;
};
export type PersonalInfoResponse = {
  input_text?: string | null;
  personal_info: PersonalInfo;
  /** Confidence score between 0 and 1 */
  confidence: number;
  /** Whether data came from 'text' or 'image' */
  source_type: string;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type PersonalInfoRequest = {
  input_text: string;
};
export type BodyParsePersonalInfoFromImageApiPersonalInfoParseImagePost = {
  file: Blob;
};
export const {
  useRedirectToSwaggerGetQuery,
  useParsePersonalInfoApiPersonalInfoParsePostMutation,
  useParsePersonalInfoFromImageApiPersonalInfoParseImagePostMutation,
} = injectedRtkApi;
