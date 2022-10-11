import { Operator, ScanCriteria } from "../models/resource/common/Common";
import { Value } from "../models/resource/google/protobuf/struct";

class DomainHelper {
  public getScanCriteria(criteria: { [key: string]: any }): ScanCriteria[] {
    const scanCriteria: ScanCriteria[] = [];

    for (const key in criteria) {
      scanCriteria.push({
        key,
        operator: Operator.EQUAL,
        value: criteria[key],
      });
    }

    return scanCriteria;
  }
}

export default new DomainHelper();
