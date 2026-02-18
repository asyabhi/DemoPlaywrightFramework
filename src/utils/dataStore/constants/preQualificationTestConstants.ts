import { InterceptorTestId } from './testIds/interceptorTestId.enum';
import { IncomeExpenditureTestId } from './testIds/incomeAndExpenditureTestId.enum';
import { ApplicantType } from '../constants/applicantType.enum';
import { OtpSet } from '../constants/otpSet.enum';

interface TestIds {
  Interceptor: typeof InterceptorTestId;
  IncomeAndExpenditure: typeof IncomeExpenditureTestId;
}

interface OtpDigitsMap {
  [OtpSet.SEQUENTIAL]: readonly string[];
  [OtpSet.HIGH_DIGITS]: readonly string[];
}

export const TEST_CONSTANTS = Object.freeze({
  TEST_IDS: {
    Interceptor: InterceptorTestId,
    IncomeAndExpenditure: IncomeExpenditureTestId,
  } as TestIds,
  APPLICANT_TYPES: ApplicantType,
  OTP_DIGITS: {
    [OtpSet.SEQUENTIAL]: Object.freeze(['1', '2', '3', '4', '5', '6']),
    [OtpSet.HIGH_DIGITS]: Object.freeze(['5', '6', '7', '8', '9', '0']),
  } as OtpDigitsMap,
});
