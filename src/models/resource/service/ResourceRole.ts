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
  CreateResourceRoleInput,
  ResourceRole,
  ResourceRoleList,
  UpdateResourceRoleInput,
} from "../resource/ResourceRole";

export type ResourceRoleService = typeof ResourceRoleService;
export const ResourceRoleService = {
  scan: {
    path: "/topcoder.domain.resource_role_service.ResourceRole/Scan",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ScanRequest) => Buffer.from(ScanRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ScanRequest.decode(value),
    responseSerialize: (value: ScanResult) => Buffer.from(ScanResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ScanResult.decode(value),
  },
  lookup: {
    path: "/topcoder.domain.resource_role_service.ResourceRole/Lookup",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: ResourceRole) => Buffer.from(ResourceRole.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRole.decode(value),
  },
  create: {
    path: "/topcoder.domain.resource_role_service.ResourceRole/Create",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateResourceRoleInput) => Buffer.from(CreateResourceRoleInput.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateResourceRoleInput.decode(value),
    responseSerialize: (value: ResourceRole) => Buffer.from(ResourceRole.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRole.decode(value),
  },
  update: {
    path: "/topcoder.domain.resource_role_service.ResourceRole/Update",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: UpdateResourceRoleInput) => Buffer.from(UpdateResourceRoleInput.encode(value).finish()),
    requestDeserialize: (value: Buffer) => UpdateResourceRoleInput.decode(value),
    responseSerialize: (value: ResourceRoleList) => Buffer.from(ResourceRoleList.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRoleList.decode(value),
  },
  delete: {
    path: "/topcoder.domain.resource_role_service.ResourceRole/Delete",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: ResourceRoleList) => Buffer.from(ResourceRoleList.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceRoleList.decode(value),
  },
} as const;

export interface ResourceRoleServer extends UntypedServiceImplementation {
  scan: handleUnaryCall<ScanRequest, ScanResult>;
  lookup: handleUnaryCall<LookupCriteria, ResourceRole>;
  create: handleUnaryCall<CreateResourceRoleInput, ResourceRole>;
  update: handleUnaryCall<UpdateResourceRoleInput, ResourceRoleList>;
  delete: handleUnaryCall<LookupCriteria, ResourceRoleList>;
}

export interface ResourceRoleClient extends Client {
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
    callback: (error: ServiceError | null, response: ResourceRole) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRole) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRole) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceRoleInput,
    callback: (error: ServiceError | null, response: ResourceRole) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceRoleInput,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRole) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceRoleInput,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRole) => void,
  ): ClientUnaryCall;
  update(
    request: UpdateResourceRoleInput,
    callback: (error: ServiceError | null, response: ResourceRoleList) => void,
  ): ClientUnaryCall;
  update(
    request: UpdateResourceRoleInput,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRoleList) => void,
  ): ClientUnaryCall;
  update(
    request: UpdateResourceRoleInput,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRoleList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    callback: (error: ServiceError | null, response: ResourceRoleList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceRoleList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceRoleList) => void,
  ): ClientUnaryCall;
}

export const ResourceRoleClient = makeGenericClientConstructor(
  ResourceRoleService,
  "topcoder.domain.resource_role_service.ResourceRole",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): ResourceRoleClient;
  service: typeof ResourceRoleService;
};
