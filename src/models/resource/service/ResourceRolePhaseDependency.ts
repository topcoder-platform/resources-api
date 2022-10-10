/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  ChannelOptions,
  Client,
  ClientUnaryCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import { LookupCriteria, ScanRequest, ScanResult } from "../common/Common";
import {
  CreateResourceRolePhaseDependencyInput,
  ResourceRolePhaseDependency,
  ResourceRolePhaseDependencyList,
} from "../resource/ResourceRolePhaseDependency";

export type ResourceRolePhaseDependencyService = typeof ResourceRolePhaseDependencyService;
export const ResourceRolePhaseDependencyService = {
  scan: {
    path: "/topcoder.domain.resource_role_phase_dependency_service.ResourceRolePhaseDependency/Scan",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ScanRequest) => Buffer.from(ScanRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ScanRequest.decode(value),
    responseSerialize: (value: ScanResult) => Buffer.from(ScanResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ScanResult.decode(value),
  },
  lookup: {
    path: "/topcoder.domain.resource_role_phase_dependency_service.ResourceRolePhaseDependency/Lookup",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: ResourceRolePhaseDependency) =>
      Buffer.from(ResourceRolePhaseDependency.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRolePhaseDependency.decode(value),
  },
  create: {
    path: "/topcoder.domain.resource_role_phase_dependency_service.ResourceRolePhaseDependency/Create",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateResourceRolePhaseDependencyInput) =>
      Buffer.from(CreateResourceRolePhaseDependencyInput.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateResourceRolePhaseDependencyInput.decode(value),
    responseSerialize: (value: ResourceRolePhaseDependency) =>
      Buffer.from(ResourceRolePhaseDependency.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRolePhaseDependency.decode(value),
  },
  /** rpc Update(UpdateResourceRequest) returns (MutationResult); */
  delete: {
    path: "/topcoder.domain.resource_role_phase_dependency_service.ResourceRolePhaseDependency/Delete",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: ResourceRolePhaseDependencyList) =>
      Buffer.from(ResourceRolePhaseDependencyList.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRolePhaseDependencyList.decode(value),
  },
} as const;

export interface ResourceRolePhaseDependencyServer extends UntypedServiceImplementation {
  scan: handleUnaryCall<ScanRequest, ScanResult>;
  lookup: handleUnaryCall<LookupCriteria, ResourceRolePhaseDependency>;
  create: handleUnaryCall<CreateResourceRolePhaseDependencyInput, ResourceRolePhaseDependency>;
  /** rpc Update(UpdateResourceRequest) returns (MutationResult); */
  delete: handleUnaryCall<LookupCriteria, ResourceRolePhaseDependencyList>;
}

export interface ResourceRolePhaseDependencyClient extends Client {
  scan(request: ScanRequest, callback: (error: ServiceError | null, response: ScanResult) => void): ClientUnaryCall;
  scan(
    request: ScanRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ScanResult) => void,
  ): ClientUnaryCall;
  scan(
    request: ScanRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ScanResult) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependency) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependency) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependency) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceRolePhaseDependencyInput,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependency) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceRolePhaseDependencyInput,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependency) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceRolePhaseDependencyInput,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependency) => void,
  ): ClientUnaryCall;
  /** rpc Update(UpdateResourceRequest) returns (MutationResult); */
  delete(
    request: LookupCriteria,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependencyList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependencyList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRolePhaseDependencyList) => void,
  ): ClientUnaryCall;
}

export const ResourceRolePhaseDependencyClient = makeGenericClientConstructor(
  ResourceRolePhaseDependencyService,
  "topcoder.domain.resource_role_phase_dependency_service.ResourceRolePhaseDependency",
) as unknown as {
  new (
    address: string,
    credentials: ChannelCredentials,
    options?: Partial<ChannelOptions>,
  ): ResourceRolePhaseDependencyClient;
  service: typeof ResourceRolePhaseDependencyService;
};
