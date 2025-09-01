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
export type PersonalInfo = {
  name?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip_code?: string | null;
  phone_number?: string | null;
  email?: string | null;
};
export type PersonalInfoResponse = {
  input_text: string;
  personal_info: PersonalInfo;
  confidence: number;
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
export const {
  useRedirectToSwaggerGetQuery,
  useParsePersonalInfoApiPersonalInfoParsePostMutation,
} = injectedRtkApi;
