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
import { CreateResourceInput, Resource, ResourceList } from "../resource/Resource";

export type ResourceService = typeof ResourceService;
export const ResourceService = {
  scan: {
    path: "/topcoder.domain.resource_service.Resource/Scan",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ScanRequest) => Buffer.from(ScanRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ScanRequest.decode(value),
    responseSerialize: (value: ScanResult) => Buffer.from(ScanResult.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ScanResult.decode(value),
  },
  lookup: {
    path: "/topcoder.domain.resource_service.Resource/Lookup",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: Resource) => Buffer.from(Resource.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Resource.decode(value),
  },
  create: {
    path: "/topcoder.domain.resource_service.Resource/Create",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: CreateResourceInput) => Buffer.from(CreateResourceInput.encode(value).finish()),
    requestDeserialize: (value: Buffer) => CreateResourceInput.decode(value),
    responseSerialize: (value: Resource) => Buffer.from(Resource.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Resource.decode(value),
  },
  /** rpc Update(topcoder.domain.resource.UpdateResourceInput) returns (topcoder.domain.resource.ResourceList); */
  delete: {
    path: "/topcoder.domain.resource_service.Resource/Delete",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: LookupCriteria) => Buffer.from(LookupCriteria.encode(value).finish()),
    requestDeserialize: (value: Buffer) => LookupCriteria.decode(value),
    responseSerialize: (value: ResourceList) => Buffer.from(ResourceList.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ResourceList.decode(value),
  },
} as const;

export interface ResourceServer extends UntypedServiceImplementation {
  scan: handleUnaryCall<ScanRequest, ScanResult>;
  lookup: handleUnaryCall<LookupCriteria, Resource>;
  create: handleUnaryCall<CreateResourceInput, Resource>;
  /** rpc Update(topcoder.domain.resource.UpdateResourceInput) returns (topcoder.domain.resource.ResourceList); */
  delete: handleUnaryCall<LookupCriteria, ResourceList>;
}

export interface ResourceClient extends Client {
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
  lookup(request: LookupCriteria, callback: (error: ServiceError | null, response: Resource) => void): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  lookup(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceInput,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceInput,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  create(
    request: CreateResourceInput,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Resource) => void,
  ): ClientUnaryCall;
  /** rpc Update(topcoder.domain.resource.UpdateResourceInput) returns (topcoder.domain.resource.ResourceList); */
  delete(
    request: LookupCriteria,
    callback: (error: ServiceError | null, response: ResourceList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ResourceList) => void,
  ): ClientUnaryCall;
  delete(
    request: LookupCriteria,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ResourceList) => void,
  ): ClientUnaryCall;
}

export const ResourceClient = makeGenericClientConstructor(
  ResourceService,
  "topcoder.domain.resource_service.Resource",
) as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): ResourceClient;
  service: typeof ResourceService;
};
